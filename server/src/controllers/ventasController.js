// server/src/controllers/ventasController.js
import db from '../../models/index.js';
import { sequelize } from '../../config/db.js';
//import { Venta, Cliente, Producto, Proveedor, Stock, DetalleVenta } from '../../models/index.js'; // Esta línea DEBE seguir comentada o eliminada

const { Venta, Cliente, Producto, Proveedor, Stock, DetalleVenta } = db; // Desestructura los modelos del objeto db importado (Mantén esta línea)

export const getVentas = async (req, res) => {
  try {
    const ventas = await Venta.findAll({
      include: [
        { model: Cliente, as: 'cliente' },
        {
          model: DetalleVenta,
          as: 'detalles',
          include: [{ model: Producto, as: 'producto' }] // Incluir producto en detalles
        }
      ]
    });
    res.json(ventas);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
};


export const getVentaById = async (req, res) => {
  try {
    // Nota: En getVentaById, quizás también quieras incluir los detalles de venta
    // como en getVentas para ver los productos específicos vendidos en esa venta.
    // La inclusión de Producto y Proveedor directamente en la Venta principal no es correcta
    // porque están relacionados a través de DetalleVenta y Producto.
    // Sugiero cambiar la inclusión a algo similar a getVentas:
    const venta = await Venta.findByPk(req.params.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        {
            model: DetalleVenta,
            as: 'detalles',
            include: [{ model: Producto, as: 'producto' }] // Incluir producto en detalles
        }
        // Si necesitas info del proveedor del producto, se accede via detalles -> producto -> proveedor
      ]
    });
    if (!venta) {
      return res.status(404).json({ msg: 'Venta no encontrada' });
    }
    res.json(venta);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


export const createVenta = async (req, res) => {
  // Esperamos recibir en req.body:
  // fecha, cliente_id, detalles (array de { producto_id, cantidad, precio_unitario, subtotal }),
  // metodo_pago, monto_pagado (opcional, si no es pago completo o si es "Debe")
  const { fecha, cliente_id, detalles, metodo_pago, monto_pagado } = req.body;

  const t = await sequelize.transaction();

  try {
    // Calcular el total de la venta a partir de los detalles recibidos
    // Esto es más seguro que confiar en un 'total' enviado desde el cliente
    let totalCalculado = 0;
    for (const detalle of detalles) {
        totalCalculado += detalle.subtotal; // Asegúrate de que subtotal venga calculado o calcúlalo aquí (detalle.cantidad * detalle.precio_unitario)
    }

    // Determinar monto adeudado
    // Si monto_pagado no viene, asumimos que adeuda el total si el metodo_pago lo permite (ej: "Debe")
    // Si viene monto_pagado, la deuda es el total menos lo pagado.
    const montoPagadoReal = parseFloat(monto_pagado) || 0; // Convierte a número, si es null/undefined/0, se toma 0
    const montoDeudaCalculado = totalCalculado - montoPagadoReal;
    const montoDeudaFinal = montoDeudaCalculado > 0 ? montoDeudaCalculado : 0; // Asegura que la deuda no sea negativa

    // Crear la venta principal con todos los datos
    const nuevaVenta = await Venta.create({
      fecha,
      total: totalCalculado, // Usamos el total calculado
      cliente_id,
      metodo_pago,
      monto_pagado: montoPagadoReal,
      monto_deuda: montoDeudaFinal
    }, { transaction: t });

    // Crear detalles de venta y actualizar stock
    for (const detalle of detalles) {
        // Opcional: Recalcular subtotal aquí para mayor seguridad
        // const subtotalCalculado = detalle.cantidad * detalle.precio_unitario;

      await DetalleVenta.create({
        venta_id: nuevaVenta.id,
        producto_id: detalle.producto_id,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario,
        subtotal: detalle.subtotal // O usar subtotalCalculado
      }, { transaction: t });

      // Actualizar stock
      const stock = await Stock.findOne({
        where: { producto_id: detalle.producto_id },
        transaction: t
      });

        if (!stock) {
             // Si no hay stock para el producto, lanzar un error para abortar la transacción
             throw new Error(`Stock no encontrado para el producto con ID ${detalle.producto_id}`);
        }

        if (stock.unidad < detalle.cantidad) {
            // Opcional: Validar si hay suficiente stock ANTES de descontar
            throw new Error(`Stock insuficiente para el producto con ID ${detalle.producto_id}. Disponible: ${stock.unidad}, Requerido: ${detalle.cantidad}`);
        }

      stock.unidad -= detalle.cantidad;
      await stock.save({ transaction: t });
    }

    // Si todo sale bien, confirmar la transacción
    await t.commit();

    // Respuesta exitosa, opcionalmente puedes devolver la venta completa con detalles
    res.status(201).json(await Venta.findByPk(nuevaVenta.id, {
      include: [
            { model: DetalleVenta, as: 'detalles', include: [{ model: Producto, as: 'producto' }] },
            { model: Cliente, as: 'cliente' } // Incluir cliente en la respuesta final si es útil
        ]
    }));

  } catch (err) {
    // Si hay algún error, revertir la transacción
    await t.rollback();
    console.error('Error al crear la venta:', err); // Loguea el error en el servidor
    res.status(500).send('Error al crear la venta: ' + err.message); // Envía el mensaje de error al cliente
  }
};

// @route   PUT /api/ventas/:id
// @desc    Actualizar una venta (NOTA: Actualizar ventas y stock es complejo y NO implementado aquí)
// @access  Public
export const updateVenta = async (req, res) => {
    res.status(501).json({ msg: "La actualización de ventas con ajuste de stock no está implementada." });
    // Mantienes este placeholder por ahora
};


// @route   DELETE /api/ventas/:id
// @desc    Eliminar una venta (NOTA: Eliminar ventas y ajustar stock es complejo y NO implementado aquí)
// @access  Public
export const deleteVenta = async (req, res) => {
    // La lógica para eliminar una venta y REVERTIR el stock (devolver la cantidad vendida al stock)
    // también es compleja y requiere transacciones.
    res.status(501).json({ msg: "La eliminación de ventas con ajuste de stock no está implementada." });
    // Mantienes este placeholder por ahora
};
// server/src/controllers/ventasController.js
import db from '../../models/index.js';
import { sequelize } from '../../config/db.js';

// Desestructura los modelos del objeto db importado
const { Venta, Cliente, Producto, Stock, DetalleVenta } = db;

export const getVentas = async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            include: [
                { model: Cliente, as: 'cliente' },
                {
                    model: DetalleVenta,
                    as: 'detalles',
                    include: [{ model: Producto, as: 'producto' }]
                }
            ],
            order: [['fecha', 'DESC']] // Opcional: ordenar ventas por fecha
        });
        res.json(ventas);
    } catch (err) {
        console.error('Error al obtener ventas:', err);
        res.status(500).send('Error: ' + err.message);
    }
};

export const getVentaById = async (req, res) => {
    try {
        const venta = await Venta.findByPk(req.params.id, {
            include: [
                { model: Cliente, as: 'cliente' },
                {
                    model: DetalleVenta,
                    as: 'detalles',
                    include: [{ model: Producto, as: 'producto' }]
                }
            ]
        });
        if (!venta) {
            return res.status(404).json({ msg: 'Venta no encontrada' });
        }
        res.json(venta);
    } catch (err) {
        console.error('Error al obtener venta por ID:', err.message);
        res.status(500).send('Server Error');
    }
};

export const createVenta = async (req, res) => {
    const { fecha, cliente_id, detalles, metodo_pago, monto_pagado } = req.body;

    // Iniciar una transacción
    const t = await sequelize.transaction();

    try {
        let totalCalculado = 0;
        const detallesParaCrear = [];

        // 1. Validar productos, calcular subtotales/total y actualizar stock
        for (const detalleInput of detalles) {
            const producto = await Producto.findByPk(detalleInput.producto_id, { transaction: t });
            if (!producto) {
                throw new Error(`Producto con ID ${detalleInput.producto_id} no encontrado.`);
            }

            const stock = await Stock.findOne({
                where: { producto_id: detalleInput.producto_id },
                transaction: t,
                lock: true // Opcional: Bloquea la fila de stock para evitar condiciones de carrera.
                           // Considera si es necesario según el volumen de transacciones.
            });

            if (!stock) {
                throw new Error(`Stock no encontrado para el producto '${producto.nombre}' (ID: ${detalleInput.producto_id}).`);
            }
            if (stock.unidad < detalleInput.cantidad) {
                throw new Error(`Stock insuficiente para el producto '${producto.nombre}'. Disponible: ${stock.unidad}, Requerido: ${detalleInput.cantidad}`);
            }

            const precioUnitarioReal = parseFloat(producto.precio);
            const subtotal = precioUnitarioReal * detalleInput.cantidad;
            totalCalculado += subtotal;

            detallesParaCrear.push({
                producto_id: detalleInput.producto_id,
                cantidad: detalleInput.cantidad,
                precio_unitario: precioUnitarioReal,
                subtotal: subtotal
            });

            // Descontar la cantidad vendida del stock
            stock.unidad = parseFloat(stock.unidad) - parseFloat(detalleInput.cantidad);
            await stock.save({ transaction: t });
        }

        // 2. Determinar monto pagado y adeudado
        const montoPagadoReal = parseFloat(monto_pagado) || 0;
        const montoDeudaCalculado = totalCalculado - montoPagadoReal;
        const montoDeudaFinal = montoDeudaCalculado > 0 ? montoDeudaCalculado : 0;

        // 3. Crear la venta principal con todos los datos
        const nuevaVenta = await Venta.create({
            fecha,
            total: totalCalculado,
            cliente_id,
            metodo_pago,
            monto_pagado: montoPagadoReal,
            monto_deuda: montoDeudaFinal
        }, { transaction: t });

        // 4. Crear los detalles de venta asociados a la nueva venta
        // Usamos Promise.all para crear todos los detalles en paralelo dentro de la misma transacción
        await Promise.all(detallesParaCrear.map(detalle =>
            DetalleVenta.create({
                venta_id: nuevaVenta.id,
                ...detalle
            }, { transaction: t })
        ));

        // 5. Actualizar la deuda del cliente si hay un monto adeudado
        if (montoDeudaFinal > 0) {
            const cliente = await Cliente.findByPk(cliente_id, { transaction: t, lock: true }); // Bloquear cliente también
            if (!cliente) {
                // Esto no debería ocurrir si cliente_id viene de una selección válida del frontend
                throw new Error(`Cliente con ID ${cliente_id} no encontrado durante la actualización de deuda.`);
            }
            cliente.monto_deuda = parseFloat(cliente.monto_deuda || 0) + montoDeudaFinal;
            await cliente.save({ transaction: t });
        }

        // Si todo fue bien, confirmar la transacción
        await t.commit();

        // Responder con la venta completa (incluyendo detalles y cliente)
        res.status(201).json(await Venta.findByPk(nuevaVenta.id, {
            include: [
                { model: DetalleVenta, as: 'detalles', include: [{ model: Producto, as: 'producto' }] },
                { model: Cliente, as: 'cliente' }
            ]
        }));

    } catch (err) {
        // Si algo falla, revertir la transacción
        await t.rollback();
        console.error('Error al crear la venta:', err);
        // Devolver un mensaje de error claro al cliente
        res.status(500).send('Error al crear la venta: ' + err.message);
    }
};

// Las funciones updateVenta y deleteVenta quedan como marcadores de posición,
// ya que su implementación con ajuste de stock es más compleja y depende de la lógica de negocio.
export const updateVenta = async (req, res) => {
    res.status(501).json({ msg: "La actualización de ventas con ajuste de stock no está implementada." });
};

export const deleteVenta = async (req, res) => {
    res.status(501).json({ msg: "La eliminación de ventas con ajuste de stock no está implementada." });
};
// server/src/controllers/stockController.js
import db from '../../models/index.js';
const { Stock, Producto, Proveedor } = db;

export const getStock = async (req, res) => {
  try {
    const stock = await Stock.findAll({
      include: [
        {
          model: Producto,
          as: 'producto',
          attributes: ['id', 'nombre', 'codigo', 'precio', 'medida', 'proveedor_id'],
          include: [
            {
              model: Proveedor,
              as: 'proveedor',
              attributes: ['empresa']
            }
          ]
        }
      ]
    });
    res.json(stock);
  } catch (err) {
    console.error('Error al obtener stock:', err);
    res.status(500).send('Error: ' + err.message);
  }
};

export const getStockById = async (req, res) => {
  try {
    const stock = await Stock.findByPk(req.params.id, {
      include: {
        model: Producto,
        as: 'producto'
      }
    });
    if (!stock) {
      return res.status(404).json({ msg: 'Registro de stock no encontrado' });
    }
    res.json(stock);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const createStock = async (req, res) => {
  const { producto_id, unidad, precio_compra } = req.body; 

  if (!producto_id || unidad === undefined || parseFloat(unidad) < 0 || precio_compra === undefined || parseFloat(precio_compra) < 0) { // <-- Validar precio_compra
    return res.status(400).json({ msg: 'Producto ID, cantidad y precio de compra válidos son requeridos.' });
  }

  try {
    const productoExistente = await Producto.findByPk(producto_id);
    if (!productoExistente) {
      return res.status(404).json({ msg: 'Producto asociado no encontrado.' });
    }

    let stockExistente = await Stock.findOne({ where: { producto_id } });

    if (stockExistente) {
      await stockExistente.update({
        unidad: parseFloat(stockExistente.unidad) + parseFloat(unidad),
        precio_compra: parseFloat(precio_compra)
      });
      await stockExistente.reload({
        include: {
          model: Producto,
          as: 'producto'
        }
      });
      return res.json(stockExistente);
    } else {
      if (unidad <= 0) {
        return res.status(400).json({ msg: 'No se puede crear un registro de stock con cantidad cero o negativa.' });
      }
      const nuevoStock = await Stock.create({
        producto_id,
        unidad: parseFloat(unidad),
        precio_compra: parseFloat(precio_compra) // <-- Guardar precio_compra
      });
      await nuevoStock.reload({
        include: {
          model: Producto,
          as: 'producto'
        }
      });
      res.json(nuevoStock);
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error: ' + err.message); // Mejorar el mensaje de error
  }
};

export const updateStock = async (req, res) => {
  const { producto_id, unidad, precio_compra } = req.body; // <-- Desestructurar precio_compra
  const stockId = req.params.id;

  if (unidad !== undefined && parseFloat(unidad) < 0) { // <-- Validar unidad
    return res.status(400).json({ msg: 'La cantidad no puede ser negativa.' });
  }
  if (precio_compra !== undefined && parseFloat(precio_compra) < 0) { // <-- Validar precio_compra
    return res.status(400).json({ msg: 'El precio de compra no puede ser negativo.' });
  }

  try {
    let stock = await Stock.findByPk(stockId, { include: { model: Producto, as: 'producto' } });
    if (!stock) {
      return res.status(404).json({ msg: 'Registro de stock no encontrado.' });
    }

    if (producto_id && producto_id !== stock.producto_id) {
      const productoExistente = await Producto.findByPk(producto_id);
      if (!productoExistente) {
        return res.status(404).json({ msg: 'Nuevo producto asociado no encontrado.' });
      }
    }

    await stock.update({
      producto_id: producto_id !== undefined ? producto_id : stock.producto_id,
      unidad: unidad !== undefined ? parseFloat(unidad) : stock.unidad,
      precio_compra: precio_compra !== undefined ? parseFloat(precio_compra) : stock.precio_compra // <-- Actualizar precio_compra
    });
    await stock.reload({ include: { model: Producto, as: 'producto' } });
    res.json(stock);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error: ' + err.message); 
  }
};

export const deleteStock = async (req, res) => {
  const stockId = req.params.id;
  try {
    const stock = await Stock.findByPk(stockId);
    if (!stock) {
      return res.status(404).json({ msg: 'Registro de stock no encontrado.' });
    }
    await stock.destroy();
    res.json({ msg: 'Registro de stock eliminado.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error: ' + err.message); 
  }
};
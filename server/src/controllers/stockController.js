// server/src/controllers/stockController.js
import db from '../../models/index.js';

const { Stock, Producto } = db;

export const getStock = async (req, res) => {
  try {
    const stock = await Stock.findAll({
      include: {
        model: Producto,
        as: 'producto' // Usar el alias definido
      }
    });
    res.json(stock);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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
  const { producto_id, unidad } = req.body;

  // Validar datos de entrada
  if (!producto_id || unidad === undefined || unidad < 0) { // unidad no puede ser negativa
     return res.status(400).json({ msg: 'Producto ID y unidad válidos son requeridos.' });
  }

  try {
    // Validar si el producto existe
    const productoExistente = await Producto.findByPk(producto_id);
     if (!productoExistente) {
       return res.status(404).json({ msg: 'Producto asociado no encontrado.' });
     }

    // Buscar si ya existe stock para este producto
    let stockExistente = await Stock.findOne({ where: { producto_id } });

    if (stockExistente) {
      // Si existe, actualiza la cantidad sumando la nueva unidad
      await stockExistente.update({
        unidad: parseFloat(stockExistente.unidad) + parseFloat(unidad) // Asegurar que son números
      });
       await stockExistente.reload({
          include: {
           model: Producto,
           as: 'producto'
         }
        });
      return res.json(stockExistente);
    } else {
      // Si no existe, crea un nuevo registro de stock
        if (unidad <= 0) { // No crear stock si la unidad inicial es 0 o negativa
            return res.status(400).json({ msg: 'No se puede crear un registro de stock con unidad cero o negativa.' });
        }
      const nuevoStock = await Stock.create({
        producto_id,
        unidad: parseFloat(unidad) // Asegurar que es número
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
    res.status(500).send('Server Error');
  }
};

export const updateStock = async (req, res) => {
  const { producto_id, unidad } = req.body;
  const stockId = req.params.id;

   // Validar datos de entrada
   if (unidad !== undefined && unidad < 0) {
       return res.status(400).json({ msg: 'La unidad no puede ser negativa.' });
   }


  try {
    let stock = await Stock.findByPk(stockId, { include: { model: Producto, as: 'producto' } });
    if (!stock) {
      return res.status(404).json({ msg: 'Registro de stock no encontrado.' });
    }

     // Opcional: Validar si el nuevo producto_id existe si se proporciona
     if (producto_id && producto_id !== stock.producto_id) {
       const productoExistente = await Producto.findByPk(producto_id);
       if (!productoExistente) {
         return res.status(404).json({ msg: 'Nuevo producto asociado no encontrado.' });
       }
        // Opcional: Verificar si ya existe stock para el nuevo producto_id y manejar duplicados
        // let existingStockForNewProduct = await Stock.findOne({ where: { producto_id } });
        // if (existingStockForNewProduct && existingStockForNewProduct.id !== parseInt(stockId, 10)) {
        //    return res.status(400).json({ msg: 'Ya existe un registro de stock para este producto.' });
        // }
     }

    await stock.update({
      producto_id: producto_id !== undefined ? producto_id : stock.producto_id,
      unidad: unidad !== undefined ? parseFloat(unidad) : stock.unidad // Asegurar que es número
    });
    await stock.reload({ include: { model: Producto, as: 'producto' } });
    res.json(stock);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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
    res.status(500).send('Server Error');
  }
};
// server/src/controllers/productosController.js
import db from '../../models/index.js';

const { Producto, Proveedor, Stock } = db;

export const getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: {
        model: Proveedor,
        as: 'proveedor',
        attributes: ['id', 'empresa']
      }
    });
    res.json(productos);
  } catch (err) {
    res.status(500).send('Error al cargar productos');
  }
};

export const getProductoById = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, {
      include: [
        { model: Stock, as: 'stock' },
        { model: Proveedor, as: 'proveedor' }
      ]
    });
    if (!producto) {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// En productosController.js (backend)
export const createProducto = async (req, res) => {
  try {
    // Validación adicional
    if (req.body.proveedor_id) {
      const proveedorExistente = await Proveedor.findByPk(req.body.proveedor_id);
      if (!proveedorExistente) {
        return res.status(400).json({ error: 'Proveedor no existe' });
      }
    }

    const producto = await Producto.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProducto = async (req, res) => {
  const { codigo, nombre, unidad, precio } = req.body;
  const productoId = req.params.id;
  try {
    let producto = await Producto.findByPk(productoId); // No incluir Stock aquí inicialmente para validación de código
    if (!producto) {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }

    if (codigo && codigo !== producto.codigo) {
      const existingProducto = await Producto.findOne({ where: { codigo } });
      if (existingProducto && existingProducto.id !== parseInt(productoId, 10)) {
        return res.status(400).json({ msg: 'El código ya está asociado a otro producto' });
      }
    }

    await producto.update({
      codigo: codigo !== undefined ? codigo : producto.codigo,
      nombre: nombre !== undefined ? nombre : producto.nombre,
      unidad: unidad !== undefined ? unidad : producto.unidad,
      precio: precio !== undefined ? precio : producto.precio
    });
    // ¡Recargar incluyendo Stock después de la actualización!
    await producto.reload({
      include: {
        model: Stock,
        as: 'stock'
      }
    });
    res.json(producto);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const deleteProducto = async (req, res) => {
  const productoId = req.params.id;
  try {
    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }
    await producto.destroy();
    res.json({ msg: 'Producto eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
// server/src/controllers/proveedoresController.js
import db from '../../models/index.js';
const { Proveedor } = db;

// Obtener todos los proveedores
export const getProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll();
    res.json(proveedores);
  } catch (err) {
    console.error('Error al obtener proveedores:', err);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

// Crear proveedor
export const createProveedor = async (req, res) => {
  const { empresa, telefono, cbu, ciudad, direccion } = req.body;
  try {
    const nuevo = await Proveedor.create({ empresa, telefono, cbu, ciudad, direccion });
    res.status(201).json(nuevo);
  } catch (err) {
    console.error('Error al crear proveedor:', err);
    res.status(500).json({ msg: 'No se pudo crear el proveedor' });
  }
};

// Actualizar proveedor
export const updateProveedor = async (req, res) => {
  const { id } = req.params;
  try {
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) return res.status(404).json({ msg: 'Proveedor no encontrado' });

    await proveedor.update(req.body);
    res.json(proveedor);
  } catch (err) {
    console.error('Error al actualizar proveedor:', err);
    res.status(500).json({ msg: 'Error al actualizar' });
  }
};

// Eliminar proveedor
export const deleteProveedor = async (req, res) => {
  const { id } = req.params;
  try {
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) return res.status(404).json({ msg: 'Proveedor no encontrado' });

    await proveedor.destroy();
    res.json({ msg: 'Proveedor eliminado' });
  } catch (err) {
    console.error('Error al eliminar proveedor:', err);
    res.status(500).json({ msg: 'Error al eliminar' });
  }
};

// server/src/controllers/proveedoresController.js
import db from '../../models/index.js';

const { Proveedor } = db;

export const getProveedores = async (req, res) => {
  try {
    const proveedores = await db.Proveedor.findAll({
      attributes: ['id', 'empresa', 'telefono', 'cbu', 'ciudad', 'direccion']
    });
    
    res.json(proveedores);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Error al obtener proveedores',
      detalles: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};
export const getProveedorById = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ msg: 'Proveedor no encontrado' });
    }
    res.json(proveedor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const createProveedor = async (req, res) => {
  const { empresa, telefono, cbu, ciudad, direccion } = req.body;
  try {
    // Opcional: Verificar si el proveedor ya existe por algún criterio (ej. empresa y ciudad)
    // let proveedor = await Proveedor.findOne({ where: { empresa, ciudad } });
    // if (proveedor) {
    //   return res.status(400).json({ msg: 'El proveedor ya existe' });
    // }

    const nuevoProveedor = await Proveedor.create({
      empresa,
      telefono,
      cbu,
      ciudad,
      direccion
    });
    res.json(nuevoProveedor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const updateProveedor = async (req, res) => {
  const { empresa, telefono, cbu, ciudad, direccion } = req.body;
  const proveedorId = req.params.id;
  try {
    let proveedor = await Proveedor.findByPk(proveedorId);
    if (!proveedor) {
      return res.status(404).json({ msg: 'Proveedor no encontrado' });
    }

    await proveedor.update({
      empresa: empresa !== undefined ? empresa : proveedor.empresa,
      telefono: telefono !== undefined ? telefono : proveedor.telefono,
      cbu: cbu !== undefined ? cbu : proveedor.cbu,
      ciudad: ciudad !== undefined ? ciudad : proveedor.ciudad,
      direccion: direccion !== undefined ? direccion : proveedor.direccion
    });
    await proveedor.reload();
    res.json(proveedor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const deleteProveedor = async (req, res) => {
  const proveedorId = req.params.id;
  try {
    const proveedor = await Proveedor.findByPk(proveedorId);
    if (!proveedor) {
      return res.status(404).json({ msg: 'Proveedor no encontrado' });
    }
    await proveedor.destroy();
    res.json({ msg: 'Proveedor eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
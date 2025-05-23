// server/src/routes/proveedores.routes.js
import express from 'express';
import { 
  getProveedores, 
  createProveedor, 
  updateProveedor, 
  deleteProveedor 
} from '../controllers/proveedoresController.js';

const router = express.Router();

router.get('/', getProveedores);        // GET /api/proveedores
router.post('/', createProveedor);      // POST /api/proveedores
router.put('/:id', updateProveedor);    // PUT /api/proveedores/:id
router.delete('/:id', deleteProveedor); // DELETE /api/proveedores/:id

export default router;
// server/src/routes/ventas.routes.js
import { Router } from 'express';
import {
  getVentas,
  getVentaById,
  createVenta,
  updateVenta,
  deleteVenta
} from '../controllers/ventasController.js';

const router = Router();

router.get('/', getVentas);
router.get('/:id', getVentaById);
router.post('/', createVenta);
router.put('/:id', updateVenta);
router.delete('/:id', deleteVenta);

export default router;
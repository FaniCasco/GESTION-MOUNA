// server/src/routes/stock.routes.js
import { Router } from 'express';
import {
  getStock,
  getStockById,
  createStock,
  updateStock,
  deleteStock
} from '../controllers/stockController.js';

const router = Router();

router.get('/', getStock);
router.get('/:id', getStockById);
router.post('/', createStock);
router.put('/:id', updateStock);
router.delete('/:id', deleteStock);

export default router;
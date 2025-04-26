//server/src/routes/clientes.routes.js
import { Router } from "express";

const router = Router();

// Ruta de prueba
router.get("/", (req, res) => {
  res.json({ message: "Ruta de clientes funcionando" });
});
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los clientes' });
  }
});


export default router;

import { sequelize, testDBConnection } from './config/db.js'; 
import cors from 'cors';
import clientesRoutes from './routes/clientes.routes.js';
import express from 'express';

const app = express(); // 🔥 Primero creás app

app.use(cors());
app.use(express.json());
app.use('/clientes', clientesRoutes); // 🔥 Ahora sí usás app

// Testear conexión a la base
testDBConnection();

// Rutas
app.get('/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ message: 'Error al obtener los clientes' });
  }
});

// Sincronizar Sequelize y levantar server
sequelize.sync({ force: false })
  .then(() => {
    console.log('✅ Base de datos sincronizada');
    app.listen(3001, () => console.log('🚀 Servidor corriendo en puerto 3001'));
  })
  .catch(err => console.error('❌ Error al sincronizar base de datos:', err));

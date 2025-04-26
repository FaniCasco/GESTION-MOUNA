//server/src/app.js
import express from 'express';
//import Cliente from './models/Cliente.js'; 
import { sequelize, testDBConnection } from './db.js'; 
import cors from 'cors';
import clientesRoutes from './routes/clientes.routes.js';


app.use('/clientes', clientesRoutes);



const app = express();
app.use(cors());
app.use(express.json());

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

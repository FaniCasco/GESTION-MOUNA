// server/src/app.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from '../config/db.js';
import db from '../models/index.js';

// Importar rutas
import clientesRoutes from './routes/clientes.routes.js';
import productosRoutes from './routes/productos.routes.js';
import proveedoresRoutes from './routes/proveedores.routes.js';
import stockRoutes from './routes/stock.routes.js';
import ventasRoutes from './routes/ventas.routes.js';

const app = express();

// Configuración mejorada de middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Conexión a la base de datos con manejo de errores mejorado
(async () => {
  try {
    await connectDB();
    
    // Verificar conexión y modelos
    console.log('Modelos cargados:', Object.keys(db).join(', '));
    
    // Iniciar servidor solo si la conexión a DB es exitosa
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`🔗 Ruta de prueba: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Fallo al iniciar la aplicación:', error);
    process.exit(1);
  }
})();

// Middleware de verificación de conexión a DB
app.use((req, res, next) => {
  if (!db.sequelize) {
    return res.status(503).json({ 
      error: 'Servicio no disponible', 
      message: 'Base de datos no conectada' 
    });
  }
  next();
});

// Ruta de salud del sistema
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: db.sequelize ? 'Conectado' : 'Desconectado',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Montar rutas
app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/ventas', ventasRoutes);

// Manejo de errores centralizado
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Capturar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});
// server/config/db.js
import { Sequelize } from 'sequelize';
import config from './config.js';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Configuración mejorada con reintentos de conexión
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  dialectOptions: dbConfig.dialectOptions,
  logging: (...msg) => console.log(msg), // Muestra las consultas SQL
  retry: {
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
    name: 'query',
    backoffBase: 100,
    backoffExponent: 1.1,
    timeout: 60000,
    max: 5
  }
});

const connectDB = async () => {
  try {
    console.log('Intentando conectar a PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');

    // Sincronización segura (sin force: true)
    console.log('Sincronizando modelos...');
    await sequelize.sync({ alter: true }); // Usar alter en lugar de force para desarrollo
    console.log('✅ Modelos sincronizados correctamente');
  } catch (error) {
    console.error('❌ Error de conexión a PostgreSQL:', error.original || error);
    
    // Detalles específicos del error
    if (error.original) {
      console.error('Código de error:', error.original.code);
      console.error('Detalle PostgreSQL:', error.original.detail);
    }
    
    process.exit(1); // Terminar el proceso con error
  }
};

export { sequelize, connectDB };
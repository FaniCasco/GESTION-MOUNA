import { Sequelize } from 'sequelize';
import Proveedor from './proveedor.js'; // Importación directa

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: console.log
  }
);

// Registrar modelos manualmente
const db = {
  Proveedor: Proveedor(sequelize), // Inicializar el modelo
  sequelize,
  Sequelize
};

// Sincronización básica
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Base de datos lista');
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    process.exit(1);
  }
})();

export default db;
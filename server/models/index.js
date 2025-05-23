// server/models/index.js
import { Sequelize, DataTypes } from 'sequelize';
import ClienteModel from './cliente.js';
import VentaModel from './venta.js';
import DetalleVentaModel from './detalleventa.js';
import ProveedorModel from './proveedor.js';
import ProductoModel from './producto.js';
import StockModel from './stock.js'; // Nueva importación

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: console.log
  }
);

const db = {};

// Inicializa los modelos
db.Cliente = ClienteModel(sequelize, DataTypes);
db.Venta = VentaModel(sequelize, DataTypes);
db.DetalleVenta = DetalleVentaModel(sequelize, DataTypes);
db.Proveedor = ProveedorModel(sequelize, DataTypes);
db.Producto = ProductoModel(sequelize, DataTypes);
db.Stock = StockModel(sequelize, DataTypes); // Nuevo modelo

// Establece asociaciones
Object.values(db).forEach(model => {
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Test de conexión y sincronización
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Modelos sincronizados correctamente');
  } catch (err) {
    console.error('❌ Error de conexión:', err);
    process.exit(1);
  }
})();

export default db;
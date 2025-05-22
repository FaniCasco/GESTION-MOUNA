// server/config/config.js
import 'dotenv/config'; // Importar dotenv para cargar las variables de entorno

export default { // Usamos export default para ES Modules
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      // ssl: { // Habilita SSL si tu base de datos lo requiere
      //   require: true,
      //   rejectUnauthorized: false // Puede ser necesario para certificados autofirmados
      // }
    },
    logging: false // O true para ver las queries SQL en consola
  },
  test: {
    // Configuración para entorno de pruebas (ajusta según necesites)
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME + '_test', // Un nombre diferente para la base de datos de pruebas
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  },
  production: {
    // Configuración para entorno de producción (ajusta según necesites, idealmente usa variables de entorno o servicios de secretos)
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
       ssl: {
         require: true,
         rejectUnauthorized: false // Configura esto según tu proveedor de DB y certificado SSL
       }
     },
     logging: false
  }
};
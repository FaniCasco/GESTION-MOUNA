//server/src/models/Cliente.js ..
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Cliente = sequelize.define('Cliente', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
  }
});

export default Cliente;


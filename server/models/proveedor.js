// server/models/proveedor.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Proveedor extends Model {
    static associate(models) {
      Proveedor.hasMany(models.Producto, {
        foreignKey: 'proveedor_id',
        as: 'productos'
      });
    }
  }

  Proveedor.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    empresa: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    cbu: {
      type: DataTypes.STRING(30)
    },
    ciudad: {
      type: DataTypes.STRING(50)
    },
    direccion: {
      type: DataTypes.STRING(150)
    }
  }, {
    sequelize,
    modelName: 'Proveedor',
    tableName: 'proveedores',
    timestamps: false
  });

  return Proveedor;
};
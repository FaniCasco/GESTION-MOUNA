// server/models/producto.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      Producto.belongsTo(models.Proveedor, {
        foreignKey: 'proveedor_id',
        as: 'proveedor'
      });
      Producto.hasOne(models.Stock, {
        foreignKey: 'producto_id',
        as: 'stock'
      });
    }
  }

  Producto.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    unidad: {
      type: DataTypes.STRING(20)
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    proveedor_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'proveedores',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Producto',
    tableName: 'productos',
    timestamps: false // ← Esto deshabilita los timestamps
  });

  return Producto;
};
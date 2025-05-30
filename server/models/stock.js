// server/models/stock.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Stock extends Model {
    static associate(models) {
      Stock.belongsTo(models.Producto, {
        foreignKey: 'producto_id',
        as: 'producto',
      });
    }
  }

  Stock.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    unidad: {
      type: DataTypes.INTEGER, // O FLOAT si quieres decimales en la cantidad
      allowNull: false,
      defaultValue: 0
    },
    // --- COLUMNA: precio_compra ---
    precio_compra: {
      type: DataTypes.DECIMAL(10, 2), // Debe coincidir con el tipo en la migración
      allowNull: true, 
      defaultValue: 0.00
    }
  }, {
    sequelize,
    modelName: 'Stock',
    tableName: 'stock',
    timestamps: false
  });

  return Stock;
};

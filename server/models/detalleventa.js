// server/models/DetalleVenta.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class DetalleVenta extends Model {
    static associate(models) {
      DetalleVenta.belongsTo(models.Venta, {
        foreignKey: 'venta_id',
        as: 'venta'
      });
  
      DetalleVenta.belongsTo(models.Producto, {
        foreignKey: 'producto_id', 
        as: 'producto'
      });
    }
  }

  DetalleVenta.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    venta_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  
    producto_id: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos', 
        key: 'id'
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    precio_unitario: { 
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    subtotal: { 
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'DetalleVenta',
    tableName: 'detalle_ventas',
    timestamps: false
  });

  return DetalleVenta;
};

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
    venta_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ventas',
        key: 'id'
      }
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id'
      }
    },
    cantidad: DataTypes.INTEGER,
    precio_unitario: DataTypes.DECIMAL(10, 2),
    subtotal: DataTypes.DECIMAL(10, 2)
  }, {
    sequelize,
    modelName: 'DetalleVenta',
    tableName: 'detalle_ventas',
    timestamps: false
  });
  return DetalleVenta;
};
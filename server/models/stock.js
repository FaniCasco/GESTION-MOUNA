// server/models/stock.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Stock extends Model {
    static associate(models) {
      // define association here
      // Un registro de stock pertenece a un producto
      Stock.belongsTo(models.Producto, {
        foreignKey: 'producto_id',
        as: 'producto'
      });
    }
  }
  Stock.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { // Define la llave foránea
        model: 'productos', // Nombre de la tabla referenciada
        key: 'id'
      }
      // Si no quieres que un registro de stock exista si el producto es eliminado:
      // onDelete: 'CASCADE'
    },
    unidad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    }
  }, {
    sequelize,
    modelName: 'Stock',
    tableName: 'stock',
    timestamps: false,
  });
  return Stock;
};
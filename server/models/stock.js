// models/stock.js
export default (sequelize, DataTypes) => {
  class Stock extends Model {
    static associate(models) {
      Stock.belongsTo(models.Producto, {
        foreignKey: 'producto_id',
        onDelete: 'CASCADE'
      });
    }
  }

  Stock.init({
    cantidad: DataTypes.INTEGER,
    producto_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Stock',
    tableName: 'stocks',
    timestamps: false // ← Deshabilitar timestamps
  });

  return Stock;
};
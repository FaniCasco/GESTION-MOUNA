import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      Producto.belongsTo(models.Proveedor, {
        foreignKey: 'proveedor_id',
        as: 'proveedor',
      });
      Producto.hasOne(models.Stock, {
        foreignKey: 'producto_id',
        as: 'stock',
      });
    }
  }

  Producto.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [2, 100],
        },
      },
      
      medida: {
        type: DataTypes.STRING(20),
        allowNull: true, 
        defaultValue: 'uni' 
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      proveedor_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'proveedores',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Producto',
      tableName: 'productos',
      timestamps: true,
      paranoid: false,
      indexes: [
        {
          unique: true,
          fields: ['codigo'],
        },
        {
          fields: ['nombre'],
        },
      ],
    }
  );

  return Producto;
};
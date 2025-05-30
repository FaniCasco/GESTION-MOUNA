// server/models/venta.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Venta extends Model {
    static associate(models) {
      Venta.belongsTo(models.Cliente, {
        foreignKey: 'cliente_id',
        as: 'cliente'
      });

      Venta.hasMany(models.DetalleVenta, {
        foreignKey: 'venta_id',
        as: 'detalles'
      });
    }
  }

  Venta.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'id'
      }
    },
    metodo_pago: {
      type: DataTypes.STRING,
      allowNull: false
    },
    monto_pagado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    monto_deuda: { // Esto es el monto de deuda de esta VENTA específica
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    }
  }, {
    sequelize,
    modelName: 'Venta',
    tableName: 'ventas',
    timestamps: false
  });

  return Venta;
};

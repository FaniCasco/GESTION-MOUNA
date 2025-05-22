// server/models/venta.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Venta extends Model {
    static associate(models) {
  Venta.belongsTo(models.Cliente, {
    foreignKey: 'cliente_id',
    as: 'cliente'
  });

  // Relación con DetalleVenta (CORRECTO)
  Venta.hasMany(models.DetalleVenta, {
    foreignKey: 'venta_id',
    as: 'detalles'
  });

      // Eliminamos la asociación belongsTo con Producto y Proveedor aquí
      // Ya que la relación con Producto/Proveedor ahora va a través de DetalleVenta
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
    // !!! ELIMINAMOS producto_id, unidad, proveedor_id, lista1, lista2, lista3 DE AQUÍ !!!
    // Estas columnas ahora irán en la tabla detalle_ventas

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
    }
  }, {
    sequelize,
    modelName: 'Venta',
    tableName: 'ventas',
    timestamps: false, // Ajusta si tus tablas tienen createdAt/updatedAt
  });
  return Venta;
};
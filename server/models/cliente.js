// server/models/Cliente.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Cliente extends Model {
    static associate(models) {
      Cliente.hasMany(models.Venta, {
        foreignKey: 'cliente_id',
        as: 'ventas' 
      });

    }
  }

  Cliente.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    dni: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    nombre_apellido: {
      type: DataTypes.STRING,
      allowNull: false
    },
    direccion: DataTypes.STRING,
    telefono: DataTypes.STRING,
    monto_deuda: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    }
  },
    {
      sequelize,
      modelName: 'Cliente',
      tableName: 'clientes',
      timestamps: false
    });

  return Cliente;
};

import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Proveedor', {
    empresa: {
      type: DataTypes.STRING(100), // Coincide con varchar(100)
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(20), // Coincide con varchar(20)
      allowNull: false
    },
    cbu: {
      type: DataTypes.STRING(30) // varchar(30)
    },
    ciudad: {
      type: DataTypes.STRING(50) // varchar(50)
    },
    direccion: {
      type: DataTypes.STRING(150) // varchar(150)
    }
  }, {
    tableName: 'proveedores', // Nombre exacto de la tabla
    timestamps: false, // Si no tienes campos de timestamp
    paranoid: false, // Si no usas borrado lógico
    freezeTableName: true // Evita pluralización automática
  });
};
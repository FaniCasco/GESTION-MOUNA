'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar la columna `id` como clave primaria autoincremental
    await queryInterface.addColumn('stock', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    });

    // ⚠️ Si estás usando MySQL o PostgreSQL, y `producto_id` era la PK, podrías necesitar quitarla.
    // Sequelize no permite cambiar la clave primaria directamente con queryInterface.
    // Si ves un error relacionado a claves primarias duplicadas, avisame y lo resolvemos según tu base.
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar la columna `id` en caso de revertir
    await queryInterface.removeColumn('stock', 'id');
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Agrega la columna 'medida' a la tabla 'productos'
    await queryInterface.addColumn('productos', 'medida', {
      type: Sequelize.STRING(20), // Tipo de dato para la medida (ej. 'kg', 'lt', 'unidad')
      allowNull: true, // O false si siempre se requiere una medida
    });
  },

  async down (queryInterface, Sequelize) {
    // En caso de revertir la migración, elimina la columna 'medida'
    await queryInterface.removeColumn('productos', 'medida');
  }
};
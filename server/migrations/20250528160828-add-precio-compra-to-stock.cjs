'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Añadir la columna 'precio_compra' a la tabla 'stock'
    await queryInterface.addColumn('stock', 'precio_compra', {
      type: Sequelize.DECIMAL(10, 2), // Usar DECIMAL para precios
      allowNull: true, // O false si siempre debe tener un valor
      defaultValue: 0.00 // Un valor por defecto es buena práctica
    });
  },

  async down (queryInterface, Sequelize) {
    // Eliminar la columna 'precio_compra' si se hace un rollback
    await queryInterface.removeColumn('stock', 'precio_compra');
  }
};
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ventas', 'metodo_pago', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Efectivo' // o lo que prefieras como predeterminado
    });

    await queryInterface.addColumn('ventas', 'monto_pagado', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    });

    await queryInterface.addColumn('ventas', 'monto_deuda', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ventas', 'metodo_pago');
    await queryInterface.removeColumn('ventas', 'monto_pagado');
    await queryInterface.removeColumn('ventas', 'monto_deuda');
  }
};
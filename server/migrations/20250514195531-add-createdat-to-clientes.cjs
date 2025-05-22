'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('clientes', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') // ¡Cambio clave aquí!
    });
    
    await queryInterface.addColumn('clientes', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') // ¡Cambio clave aquí!
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('clientes', 'createdAt');
    await queryInterface.removeColumn('clientes', 'updatedAt');
  }
};

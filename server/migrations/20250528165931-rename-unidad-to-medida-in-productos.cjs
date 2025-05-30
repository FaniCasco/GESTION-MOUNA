'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('productos', 'unidad', 'medida');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('productos', 'medida', 'unidad');
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('productos', 'medida', {
      type: Sequelize.STRING,
      allowNull: true, // Or false, depending on if you want it mandatory for existing data
      defaultValue: 'uni' // A default value is good if existing rows will be null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('productos', 'medida');
  }
};
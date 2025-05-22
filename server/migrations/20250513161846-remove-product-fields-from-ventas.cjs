'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Eliminar las columnas de la tabla 'ventas'
    await queryInterface.removeColumn('ventas', 'producto_id');
    await queryInterface.removeColumn('ventas', 'unidad');
    // Asegúrate de eliminar solo las columnas que ya NO necesitas en la tabla 'ventas' principal
    // Según lo que dijimos, serían producto_id, unidad, proveedor_id, lista1, lista2, lista3
     await queryInterface.removeColumn('ventas', 'proveedor_id'); // Eliminar si ya no va en la tabla principal
     await queryInterface.removeColumn('ventas', 'lista1'); // Eliminar si ya no va en la tabla principal
     await queryInterface.removeColumn('ventas', 'lista2'); // Eliminar si ya no va en la tabla principal
     await queryInterface.removeColumn('ventas', 'lista3'); // Eliminar si ya no va en la tabla principal

  },

  async down (queryInterface, Sequelize) {
    // Añadir de nuevo las columnas (para deshacer la migración)
    // Debes definir el tipo de datos y constraints originales
    await queryInterface.addColumn('ventas', 'producto_id', {
        type: Sequelize.INTEGER,
        // Aquí podrías añadir references, allowNull, etc. como estaban originalmente
        // references: { model: 'productos', key: 'id' },
        allowNull: true // O como estuviera originalmente
    });
    await queryInterface.addColumn('ventas', 'unidad', {
        type: Sequelize.DECIMAL(10, 2), // Usa el tipo de dato original
        allowNull: false, // O como estuviera originalmente
        defaultValue: 0.00
    });
     // Añade de nuevo las otras columnas eliminadas si es necesario para el rollback
      await queryInterface.addColumn('ventas', 'proveedor_id', {
         type: Sequelize.INTEGER,
         // references: { model: 'proveedores', key: 'id' },
         allowNull: true
      });
      await queryInterface.addColumn('ventas', 'lista1', {
         type: Sequelize.DECIMAL(10, 2),
         defaultValue: 0.00
      });
       await queryInterface.addColumn('ventas', 'lista2', {
         type: Sequelize.DECIMAL(10, 2),
         defaultValue: 0.00
      });
       await queryInterface.addColumn('ventas', 'lista3', {
         type: Sequelize.DECIMAL(10, 2),
         defaultValue: 0.00
      });

  }
};
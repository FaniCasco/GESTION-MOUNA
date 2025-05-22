'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Crear la tabla 'detalle_ventas'
    await queryInterface.createTable('detalle_ventas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      venta_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ventas', // Nombre de la tabla de ventas (generalmente minúsculas en PostgreSQL)
          key: 'id'
        },
        onUpdate: 'CASCADE', // Opciones de restricción referencial
        onDelete: 'CASCADE' // Si una venta se elimina, sus detalles también
      },
      producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'productos', // Nombre de la tabla de productos
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // No permitir eliminar un producto si hay detalles de venta que lo referencian
      },
      cantidad: {
        type: Sequelize.DECIMAL(10, 2), // Ajusta la precisión si es necesario
        allowNull: false,
        defaultValue: 1.00
      },
      precio_unitario: {
        type: Sequelize.DECIMAL(10, 2), // Ajusta la precisión si es necesario
        allowNull: false,
        defaultValue: 0.00
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2), // Ajusta la precisión si es necesario
        allowNull: false,
        defaultValue: 0.00
        // Podrías no tener este campo si lo calculas al obtener los datos
      },
      // Sequelize agrega createdAt y updatedAt por defecto si timestamps es true en el modelo
      // Pero si no quieres timestamps en los detalles, no los definas aquí.
      // Si tu modelo DetalleVenta tiene timestamps: true, DEBES definirlos aquí:
       createdAt: {
         type: Sequelize.DATE,
         allowNull: false,
         defaultValue: Sequelize.NOW // Puedes usar DataTypes.NOW o Sequelize.literal('NOW()')
       },
       updatedAt: {
         type: Sequelize.DATE,
         allowNull: false,
         defaultValue: Sequelize.NOW
       }
    });
  },

  async down (queryInterface, Sequelize) {
    // Eliminar la tabla 'detalle_ventas'
    await queryInterface.dropTable('detalle_ventas');
  }
};
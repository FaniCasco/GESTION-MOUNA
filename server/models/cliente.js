import { Model, DataTypes } from 'sequelize'; // Importa DataTypes

export default (sequelize, DataTypes) => {
  class Cliente extends Model {
    static associate(models) {
      // define association here
      // Un cliente tiene muchas ventas
      Cliente.hasMany(models.Venta, {
        foreignKey: 'cliente_id',
        as: 'ventasCliente', // Nombre del alias para la relación
      });

      // Aquí podríamos definir asociaciones inversas si fueran necesarias en este modelo
      // Por ejemplo, si un Venta pertenece a un Cliente (definido en el modelo Venta)
    }
  }

  Cliente.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    dni: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nombre_apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true, // Permitir que la dirección sea opcional
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true, // Permitir que el teléfono sea opcional
    },
    // Eliminamos el campo 'deuda' del modelo de Sequelize
    // deuda: {
    //   type: DataTypes.DECIMAL(10, 2),
    //   defaultValue: 0.00,
    //   allowNull: false
    // }
  }, {
    sequelize,
    modelName: 'Cliente',
    tableName: 'clientes',
    timestamps: true, // Es buena práctica mantener timestamps si los tienes en la DB
    // Define un "getter" virtual para calcular la deuda
    // NOTA: Este getter solo funcionará si las ventas asociadas están cargadas
    // o si lo calculamos explícitamente en la consulta del controlador.
    // Lo usaremos principalmente para consistencia si llegas a necesitarlo,
    // pero el cálculo principal lo haremos en el controlador.
     getterMethods: {
       // Este getter ya NO es la forma recomendada de calcular deuda total sumando ventas
       // ya que requeriría cargar *todas* las ventas del cliente primero, lo cual es ineficiente.
       // El cálculo principal lo haremos en el controlador.
       // totalDeuda() {
       //    // Esta lógica dependería de tener las ventasCliente cargadas, lo cual no es eficiente
       //    return this.ventasCliente ? this.ventasCliente.reduce((sum, venta) => sum + parseFloat(venta.monto_deuda), 0) : 0;
       // }
     }
  });

  // Eliminamos el campo 'deuda' que se guarda directamente.
  // La deuda será calculada desde las ventas.

  return Cliente;
};
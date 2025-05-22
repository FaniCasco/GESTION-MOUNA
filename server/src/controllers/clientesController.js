// server/src/controllers/clientesController.js
import db from '../../models/index.js';
import { Sequelize } from 'sequelize'; // Asegúrate de importar Sequelize

const { Cliente, Venta } = db; // Asegúrate de extraer también Venta

// @route   GET /api/clientes
// @desc    Obtener todos los clientes E INCLUIR su deuda total calculada
// @access  Public
export const getClientes = async (req, res) => {
    try {
        // Modificamos la consulta para incluir la deuda calculada para cada cliente
        const clientes = await Cliente.findAll({
            attributes: [
                'id',
                'dni',
                'nombre_apellido',
                'direccion',
                'telefono',
                // Calcula la suma de monto_deuda de las ventas asociadas donde monto_deuda > 0
                [
                    Sequelize.literal(`(
                    SELECT SUM(CASE WHEN "monto_deuda" > 0 THEN "monto_deuda" ELSE 0 END)
                    FROM "ventas" AS "Venta"
                    WHERE "Venta"."cliente_id" = "Cliente"."id"
                )`),
                    'totalDeuda' // Alias para el campo calculado
                ]
            ],
            // Si solo necesitas la lista con la deuda calculada, no necesitas incluir las ventas aquí.
            // Si en la lista principal también quisieras ver un resumen de las ventas pendientes
            // (por ejemplo, cuántas tiene adeudadas), la lógica sería más compleja aquí.
        });

        // Convertir los resultados para asegurar que totalDeuda es un número
        const clientesConDeuda = clientes.map(cliente => {
            const clienteJson = cliente.toJSON();
            clienteJson.totalDeuda = parseFloat(clienteJson.totalDeuda) || 0;
            return clienteJson;
        });


        console.log(`Clientes encontrados (con deuda calculada): ${clientesConDeuda.length}`); // ← Log
        res.json(clientesConDeuda); // Envía la lista de clientes con la deuda calculada
    } catch (err) {
        console.error('Error en getClientes:', err);
        res.status(500).json({ error: err.message });
    }
};

// @route   GET /api/clientes/:id
// @desc    Obtener un cliente por ID e incluir su deuda total calculada
// @access  Public
export const getClienteById = async (req, res) => {
    try {
        const clienteId = req.params.id;

        // Consulta para obtener el cliente y calcular la suma de 'monto_deuda' de sus ventas
        const cliente = await Cliente.findByPk(clienteId, {
            attributes: [
                'id',
                'dni',
                'nombre_apellido',
                'direccion',
                'telefono',
                // Calcula la suma de monto_deuda de las ventas asociadas donde monto_deuda > 0
                [
                    Sequelize.literal(`(
                    SELECT SUM(CASE WHEN "monto_deuda" > 0 THEN "monto_deuda" ELSE 0 END)
                    FROM "ventas" AS "Venta"
                    WHERE "Venta"."cliente_id" = "Cliente"."id"
                )`),
                    'totalDeuda' // Alias para el campo calculado
                ]
            ],
            // Opcional: Si quieres incluir las ventas específicas adeudadas, puedes usar 'include'
            // include: [{
            //     model: Venta,
            //     as: 'ventasCliente',
            //     where: { monto_deuda: { [Sequelize.Op.gt]: 0 } }, // Solo ventas con deuda > 0
            //     required: false // Usa false para que el cliente aparezca aunque no tenga ventas con deuda
            // }]
        });

        if (!cliente) {
            return res.status(404).json({ msg: 'Cliente no encontrado' });
        }

        // Sequelize devuelve el resultado del literal como string, convertir a número
        const clienteConDeuda = cliente.toJSON(); // Convierte la instancia de Sequelize a objeto JSON
        clienteConDeuda.totalDeuda = parseFloat(clienteConDeuda.totalDeuda) || 0;


        res.json(clienteConDeuda); // Envía el objeto con la deuda calculada

    } catch (err) {
        console.error('Error en getClienteById:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST /api/clientes
// @desc    Crear un nuevo cliente (sin campo deuda en el body)
// @access  Public
export const createCliente = async (req, res) => {
    // Ya no esperamos el campo 'deuda' en el body para crear un cliente
    const { dni, nombre_apellido, direccion, telefono } = req.body;

    try {
        // Verificar si el cliente ya existe por DNI
        let cliente = await Cliente.findOne({ where: { dni } });

        if (cliente) {
            return res.status(400).json({ msg: 'El cliente con este DNI ya existe' });
        }

        // Crear el nuevo cliente sin especificar la deuda (por defecto será 0 si el campo existe en DB, pero no lo usamos en el modelo)
        const nuevoCliente = await Cliente.create({
            dni,
            nombre_apellido,
            direccion,
            telefono
        });

        // Opcional: Recargar el cliente recién creado para incluir campos por defecto si los hubiera (aunque eliminamos 'deuda')
        // await nuevoCliente.reload();

        res.status(201).json(nuevoCliente); // Usar status 201 para creación exitosa

    } catch (err) {
        console.error('Error en createCliente:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT /api/clientes/:id
// @desc    Actualizar un cliente (sin actualizar el campo deuda desde el body)
// @access  Public
export const updateCliente = async (req, res) => {
    // Ya no esperamos el campo 'deuda' en el body para actualizar
    const { dni, nombre_apellido, direccion, telefono } = req.body;
    const clienteId = req.params.id;

    try {
        let cliente = await Cliente.findByPk(clienteId);

        if (!cliente) {
            return res.status(404).json({ msg: 'Cliente no encontrado' });
        }

        // Validación de DNI único al actualizar
        if (dni && dni !== cliente.dni) {
            const existingCliente = await Cliente.findOne({ where: { dni } });
            if (existingCliente && existingCliente.id !== parseInt(clienteId, 10)) {
                return res.status(400).json({ msg: 'El DNI ya está asociado a otro cliente' });
            }
        }

        // Crea un objeto con los campos a actualizar, solo si existen en el body
        const updateFields = {};
        if (dni !== undefined) updateFields.dni = dni;
        if (nombre_apellido !== undefined) updateFields.nombre_apellido = nombre_apellido;
        if (direccion !== undefined) updateFields.direccion = direccion;
        if (telefono !== undefined) updateFields.telefono = telefono;

        // Si no hay campos para actualizar (excluyendo 'deuda'), puedes retornar algo o continuar
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ msg: 'No se proporcionaron campos válidos para actualizar' });
        }


        await cliente.update(updateFields); // Actualiza solo los campos proporcionados

        // Recargar para obtener los datos actualizados (aunque el campo deuda ya no viene del modelo)
        await cliente.reload({
            attributes: [
                'id', 'dni', 'nombre_apellido', 'direccion', 'telefono',
                // Recalcular la deuda después de la actualización (aunque la actualización no la cambia)
                [
                    Sequelize.literal(`(
                    SELECT SUM(CASE WHEN "monto_deuda" > 0 THEN "monto_deuda" ELSE 0 END)
                    FROM "ventas" AS "Venta"
                    WHERE "Venta"."cliente_id" = "Cliente"."id"
                )`),
                    'totalDeuda'
                ]
            ]
        });

        const clienteActualizadoConDeuda = cliente.toJSON();
        clienteActualizadoConDeuda.totalDeuda = parseFloat(clienteActualizadoConDeuda.totalDeuda) || 0;


        res.json(clienteActualizadoConDeuda); // Retorna el cliente actualizado con la deuda calculada

    } catch (err) {
        console.error('Error en updateCliente:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE /api/clientes/:id
// @desc    Eliminar un cliente
// @access  Public
export const deleteCliente = async (req, res) => {
    const clienteId = req.params.id;
    try {
        // Opcional: Verificar si el cliente tiene ventas asociadas con deuda pendiente
        // Esto podría requerir una lógica más compleja o impedir la eliminación si tiene deuda
        // Por ahora, el ON DELETE CASCADE en las ventas en la DB se encargará de eliminar las ventas al eliminar el cliente

        const cliente = await Cliente.findByPk(clienteId);

        if (!cliente) {
            return res.status(404).json({ msg: 'Cliente no encontrado' });
        }

        await cliente.destroy();

        res.json({ msg: 'Cliente eliminado' });

    } catch (err) {
        console.error('Error en deleteCliente:', err.message);
        // Podría haber un error si hay ventas asociadas y la DB no tiene ON DELETE CASCADE
        // o si hay otras relaciones que impiden la eliminación.
        res.status(500).send('Server Error');
    }
};
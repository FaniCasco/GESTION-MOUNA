// server/src/controllers/clientesController.js
import db from '../../models/index.js';
import { Sequelize } from 'sequelize'; // Asegúrate de importar Sequelize

const { Cliente, Venta } = db;
export const getClientes = async (req, res) => {
    try {
        const clientes = await Cliente.findAll({
            attributes: [
                'id',
                'dni',
                'nombre_apellido',
                'direccion',
                'telefono',
                [Sequelize.fn('SUM', Sequelize.col('ventas.monto_deuda')), 'totalDeuda']
            ],
            include: [
                {
                    model: Venta,
                    as: 'ventas', // 👈 Asegurate que el alias esté bien
                    attributes: []
                }
            ],
            group: ['Cliente.id'],
            raw: true
        });

        const clientesConDeuda = clientes.map(cliente => ({
            ...cliente,
            totalDeuda: parseFloat(cliente.totalDeuda) || 0
        }));

        res.json(clientesConDeuda);
    } catch (err) {
        console.error('Error en getClientes:', err);
        res.status(500).json({ error: err.message });
    }
};


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
        res.status(201).json(nuevoCliente); // Usar status 201 para creación exitosa

    } catch (err) {
        console.error('Error en createCliente:', err.message);
        res.status(500).send('Server Error');
    }
};
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
        } await cliente.update(updateFields); // Actualiza solo los campos proporcionados

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
export const deleteCliente = async (req, res) => {
    const clienteId = req.params.id;
    try {
        const cliente = await Cliente.findByPk(clienteId);

        if (!cliente) {
            return res.status(404).json({ msg: 'Cliente no encontrado' });
        }

        await cliente.destroy();

        res.json({ msg: 'Cliente eliminado' });

    } catch (err) {
        console.error('Error en deleteCliente:', err.message);
        res.status(500).send('Server Error');
    }
};
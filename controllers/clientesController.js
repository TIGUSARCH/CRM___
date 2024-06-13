// controllers/clientesController.js
const { Cliente, ParticipantesCita, Cita, sequelize } = require('../models/relacionesModelos');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Crear un nuevo cliente con validación detallada
exports.crearCliente = async (req, res) => {
    const { nombre, apellidoMaterno, apellidoPaterno, telefono, imagen, correoElectronico } = req.body;
    if (!nombre || !correoElectronico) {
        return res.status(400).s
        end({ message: 'Nombre y correo electrónico son obligatorios.' });
    }
    try {
        const clienteExistente = await Cliente.findOne({ where: { correoElectronico } });
        if (clienteExistente) {
            return res.status(409).send({ message: 'El correo electrónico ya está registrado.' });
        }

        const nuevoCliente = await Cliente.create({
            id: uuidv4(),
            nombre,
            apellidoMaterno,
            apellidoPaterno,
            telefono,
            imagen,
            correoElectronico
        });
        res.status(201).send(nuevoCliente);
    } catch (error) {
        res.status(500).send({ message: 'Error al crear el cliente', error: error.message });
    }
};

// Obtener todos los clientes con soporte para paginación y filtro
exports.obtenerClientes = async (req, res) => {
    try {
        const { pagina, tamano, nombre } = req.query;
        const limit = tamano ? +tamano : 10;
        const offset = pagina ? pagina * limit : 0;

        const condiciones = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : {};

        const clientes = await Cliente.findAndCountAll({
            where: condiciones,
            // limit,
            // offset,
            order: [['nombre', 'ASC']]
        });

        res.status(200).send({
            total: clientes.count,
            data: clientes.rows
        });
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener los clientes', error: error.message });
    }
};

// Obtener un cliente por ID con manejo de errores
exports.obtenerClientePorId = async (req, res) => {
    const { id } = req.params;
    try {
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            return res.status(404).send({ message: 'Cliente no encontrado.' });
        }
        res.status(200).send(cliente);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener el cliente', error: error.message });
    }
};

// Actualizar un cliente con validación
exports.actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellidoMaterno, apellidoPaterno, telefono, imagen, correoElectronico } = req.body;

    try {
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            return res.status(404).send({ message: 'Cliente no encontrado.' });
        }

        cliente.nombre = nombre || cliente.nombre;
        cliente.apellidoMaterno = apellidoMaterno || cliente.apellidoMaterno;
        cliente.apellidoPaterno = apellidoPaterno || cliente.apellidoPaterno;
        cliente.telefono = telefono || cliente.telefono;
        cliente.imagen = imagen || cliente.imagen;
        cliente.correoElectronico = correoElectronico || cliente.correoElectronico;

        await cliente.save();

        res.status(200).send(cliente);
    } catch (error) {
        res.status(500).send({ message: 'Error al actualizar el cliente', error: error.message });
    }
};

// Eliminar un cliente con verificación de citas agendadas
exports.eliminarCliente = async (req, res) => {
    const { id } = req.params;

    const transaction = await sequelize.transaction();

    try {
        // Verificar si el cliente tiene citas agendadas
        const citasAgendadas = await Cita.findOne({
            where: { clienteId: id },
            transaction
        });

        if (citasAgendadas) {
            await transaction.rollback();
            return res.status(400).json({ message: 'No se puede eliminar el cliente porque tiene citas agendadas.' });
        }

        // Eliminar los registros relacionados en participantesCita
        await ParticipantesCita.destroy({
            where: { clienteId: id },
            transaction
        });

        // Buscar y eliminar el cliente
        const cliente = await Cliente.findByPk(id, { transaction });

        if (!cliente) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        await cliente.destroy({ transaction });

        await transaction.commit();
        res.status(200).json({ message: 'Cliente eliminado' });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Error al eliminar el cliente', error: error.message });
    }
};

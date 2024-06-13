const { Evento, Usuario, sequelize } = require('../models/relacionesModelos');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

// Crear un nuevo evento con validación detallada
exports.crearEvento = async (req, res) => {
    const { titulo, descripcion, categoria, estado, fechaInicio, fechaFin, tipo, creadorId } = req.body;
    const transaction = await sequelize.transaction();

    if (!titulo || !fechaInicio || !fechaFin || !creadorId) {
        return res.status(400).send({ message: 'Título, fechas de inicio y fin, y creador son obligatorios.' });
    }

    try {
        // Validar las fechas
        const hoy = moment().tz('America/Mexico_City').startOf('day');
        const fechaInicioEvento = moment.tz(fechaInicio, 'America/Mexico_City').startOf('day');
        const fechaFinEvento = moment.tz(fechaFin, 'America/Mexico_City').startOf('day');

        if (fechaInicioEvento.isBefore(hoy) || fechaFinEvento.isBefore(hoy)) {
            await transaction.rollback();
            return res.status(400).json({ message: 'La fecha del evento no puede ser en el pasado.' });
        }

        const nuevoEvento = await Evento.create({
            id: uuidv4(),
            titulo,
            descripcion,
            categoria,
            estado,
            fechaInicio,
            fechaFin,
            tipo,
            creadorId
        }, { transaction });

        await transaction.commit();

        const eventoConDetalles = await Evento.findByPk(nuevoEvento.id, {
            include: [
                { model: Usuario }
            ]
        });

        req.io.emit('eventoCreado', eventoConDetalles); // Emitir evento de evento creado
        res.status(201).send(eventoConDetalles);
    } catch (error) {
        await transaction.rollback();
        res.status(500).send({ message: 'Error al crear el evento', error: error.message });
    }
};

// Obtener todos los eventos con soporte para paginación y filtro
exports.obtenerEventos = async (req, res) => {
    try {
        const { pagina, tamano, titulo } = req.query;
        const limit = tamano ? +tamano : 10;
        const offset = pagina ? pagina * limit : 0;

        const condiciones = titulo ? { titulo: { [Op.iLike]: `%${titulo}%` } } : {};

        const eventos = await Evento.findAndCountAll({
            where: condiciones,
            limit,
            offset,
            order: [['fechaInicio', 'ASC']],
            include: [
                { model: Usuario }
            ]
        });

        res.status(200).send({
            total: eventos.count,
            data: eventos.rows
        });
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener los eventos', error: error.message });
    }
};

// Obtener un evento por ID con manejo de errores
exports.obtenerEventoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const evento = await Evento.findByPk(id, {
            include: [
                { model: Usuario }
            ]
        });
        if (!evento) {
            return res.status(404).send({ message: 'Evento no encontrado.' });
        }
        res.status(200).send(evento);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener el evento', error: error.message });
    }
};

// Actualizar un evento con validación
exports.actualizarEvento = async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, categoria, estado, fechaInicio, fechaFin, tipo, creadorId } = req.body;
    const transaction = await sequelize.transaction();

    try {
        const evento = await Evento.findByPk(id, { transaction });
        if (!evento) {
            await transaction.rollback();
            return res.status(404).send({ message: 'Evento no encontrado.' });
        }

        // Validar las fechas si se proporcionan
        if (fechaInicio || fechaFin) {
            const hoy = moment().tz('America/Mexico_City').startOf('day');
            const fechaInicioEvento = fechaInicio ? moment.tz(fechaInicio, 'America/Mexico_City').startOf('day') : null;
            const fechaFinEvento = fechaFin ? moment.tz(fechaFin, 'America/Mexico_City').startOf('day') : null;

            if ((fechaInicioEvento && fechaInicioEvento.isBefore(hoy)) || (fechaFinEvento && fechaFinEvento.isBefore(hoy))) {
                await transaction.rollback();
                return res.status(400).json({ message: 'La fecha del evento no puede ser en el pasado.' });
            }
        }

        await evento.update({
            titulo: titulo || evento.titulo,
            descripcion: descripcion || evento.descripcion,
            categoria: categoria || evento.categoria,
            estado: estado || evento.estado,
            fechaInicio: fechaInicio || evento.fechaInicio,
            fechaFin: fechaFin || evento.fechaFin,
            tipo: tipo || evento.tipo,
            creadorId: creadorId || evento.creadorId
        }, { transaction });

        await transaction.commit();

        const eventoConDetalles = await Evento.findByPk(evento.id, {
            include: [
                { model: Usuario }
            ]
        });

        req.io.emit('eventoActualizado', eventoConDetalles); // Emitir evento de evento actualizado
        res.status(200).send(eventoConDetalles);
    } catch (error) {
        await transaction.rollback();
        res.status(500).send({ message: 'Error al actualizar el evento', error: error.message });
    }
};

// Actualizar el estado de un evento
exports.actualizarEstadoEvento = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    const transaction = await sequelize.transaction();

    try {
        const evento = await Evento.findByPk(id, { transaction });
        if (!evento) {
            await transaction.rollback();
            return res.status(404).send({ message: 'Evento no encontrado.' });
        }

        await evento.update({ estado }, { transaction });
        await transaction.commit();

        const eventoConDetalles = await Evento.findByPk(evento.id, {
            include: [
                { model: Usuario }
            ]
        });

        req.io.emit('estadoEventoActualizado', eventoConDetalles); // Emitir evento de estado de evento actualizado
        res.status(200).send(eventoConDetalles);
    } catch (error) {
        await transaction.rollback();
        res.status(500).send({ message: 'Error al actualizar el estado del evento', error: error.message });
    }
};

// Eliminar un evento
exports.eliminarEvento = async (req, res) => {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
        const evento = await Evento.findByPk(id, { transaction });
        if (!evento) {
            await transaction.rollback();
            return res.status(404).send({ message: 'Evento no encontrado.' });
        }

        await evento.destroy({ transaction });
        await transaction.commit();

        req.io.emit('eventoEliminado', { id }); // Emitir evento de evento eliminado
        res.status(200).send({ message: 'Evento eliminado exitosamente.' });
    } catch (error) {
        await transaction.rollback();
        res.status(500).send({ message: 'Error al eliminar el evento', error: error.message });
    }
};

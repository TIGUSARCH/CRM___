const { Cita, Usuario, Cliente, ParticipantesCita, Disponibilidad, Rol, sequelize } = require('../models/relacionesModelos');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

// Crear una nueva cita
exports.crearCita = async (req, res) => {
    const { nombre, descripcion, tipoCita, fecha, horaInicio, horaFin, lugar, estado, enlace, documentos, usuarioId, clienteId } = req.body;
    const transaction = await sequelize.transaction();

    try {
        // Verificar si el usuario existe
        if (usuarioId) {
            const usuario = await Usuario.findByPk(usuarioId);
            if (!usuario) {
                await transaction.rollback();
                return res.status(400).json({ message: 'El usuario no existe.' });
            }
        }

        // Verificar si el cliente existe
        if (clienteId) {
            const cliente = await Cliente.findByPk(clienteId);
            if (!cliente) {
                await transaction.rollback();
                return res.status(400).json({ message: 'El cliente no existe.' });
            }
        }

        // Validar las fechas y horas
        const hoy = moment().tz('America/Mexico_City').startOf('day');
        const fechaCita = moment.tz(fecha, 'America/Mexico_City').startOf('day');

        if (fechaCita.isBefore(hoy)) {
            await transaction.rollback();
            return res.status(400).json({ message: 'La fecha de la cita no puede ser en el pasado.' });
        }

        // Verificar la disponibilidad del usuario
        const citaExistenteUsuario = await Cita.findOne({
            where: {
                usuarioId: usuarioId,
                [Op.or]: [
                    { horaInicio: { [Op.between]: [horaInicio, horaFin] } },
                    { horaFin: { [Op.between]: [horaInicio, horaFin] } },
                    { [Op.and]: [{ horaInicio: { [Op.lte]: horaInicio } }, { horaFin: { [Op.gte]: horaFin } }] }
                ]
            },
            transaction
        });

        if (citaExistenteUsuario) {
            await transaction.rollback();
            return res.status(400).json({ message: 'El usuario ya tiene una cita en este horario.' });
        }

        // Verificar la disponibilidad del cliente
        const citaExistenteCliente = await Cita.findOne({
            where: {
                clienteId: clienteId,
                [Op.or]: [
                    { horaInicio: { [Op.between]: [horaInicio, horaFin] } },
                    { horaFin: { [Op.between]: [horaInicio, horaFin] } },
                    { [Op.and]: [{ horaInicio: { [Op.lte]: horaInicio } }, { horaFin: { [Op.gte]: horaFin } }] }
                ]
            },
            transaction
        });

        if (citaExistenteCliente) {
            await transaction.rollback();
            return res.status(400).json({ message: 'El cliente ya tiene una cita en este horario.' });
        }

        // Crear la cita
        const cita = await Cita.create({
            id: uuidv4(),
            nombre,
            descripcion,
            tipoCita,
            fecha,
            horaInicio,
            horaFin,
            lugar,
            estado,
            enlace,
            documentos,
            usuarioId,
            clienteId
        }, { transaction });

        // Crear los registros en participantesCita
        if (usuarioId) {
            await ParticipantesCita.create({
                id: uuidv4(),
                citaId: cita.id,
                usuarioId: usuarioId
            }, { transaction });

            // Actualizar disponibilidad del usuario
            await Disponibilidad.create({
                usuarioId: usuarioId,
                fechaInicio: horaInicio,
                fechaFin: horaFin,
                tipo: 'Ocupado'
            }, { transaction });
        }

        if (clienteId) {
            await ParticipantesCita.create({
                id: uuidv4(),
                citaId: cita.id,
                clienteId: clienteId
            }, { transaction });

            // Actualizar disponibilidad del cliente
            await Disponibilidad.create({
                clienteId: clienteId,
                fechaInicio: horaInicio,
                fechaFin: horaFin,
                tipo: 'Ocupado'
            }, { transaction });
        }

        await transaction.commit();
        const citaConDetalles = await Cita.findByPk(cita.id, {
            include: [
                { model: Usuario, include: [Rol] },
                Cliente
            ]
        });
        req.io.emit('citaCreada', citaConDetalles); // Emitir evento de cita creada
        res.status(201).json(citaConDetalles);
    } catch (error) {
        await transaction.rollback();
        console.log(error)
        res.status(500).json({ message: 'Error al crear la cita', error: error.message });
    }
};

// Obtener todas las citas
exports.obtenerCitas = async (req, res) => {
    try {
        const citas = await Cita.findAll({
            include: [
                { model: Usuario, include: [Rol] },
                Cliente
            ]
        });
        res.status(200).json(citas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las citas', error: error.message });
    }
};

// Obtener una cita por ID
exports.obtenerCitaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const cita = await Cita.findByPk(id, {
            include: [
                { model: Usuario, include: [Rol] },
                Cliente
            ]
        });

        if (!cita) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        res.status(200).json(cita);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la cita', error: error.message });
    }
};

// Actualizar una cita
exports.actualizarCita = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, tipoCita, fecha, horaInicio, horaFin, lugar, estado, enlace, documentos, usuarioId, clienteId } = req.body;
    const transaction = await sequelize.transaction();

    try {
        // Verificar si el usuario existe
        if (usuarioId) {
            const usuario = await Usuario.findByPk(usuarioId);
            if (!usuario) {
                await transaction.rollback();
                return res.status(400).json({ message: 'El usuario no existe.' });
            }
        }

        // Verificar si el cliente existe
        if (clienteId) {
            const cliente = await Cliente.findByPk(clienteId);
            if (!cliente) {
                await transaction.rollback();
                return res.status(400).json({ message: 'El cliente no existe.' });
            }
        }

        // Validar las fechas y horas
        const hoy = moment().tz('America/Mexico_City').startOf('day');
        const fechaCita = moment.tz(fecha, 'America/Mexico_City').startOf('day');

        if (fechaCita.isBefore(hoy)) {
            await transaction.rollback();
            return res.status(400).json({ message: 'La fecha de la cita no puede ser en el pasado.' });
        }

        // Verificar la disponibilidad para la actualización
        const citaExistenteUsuario = await Cita.findOne({
            where: {
                id: { [Op.ne]: id },
                usuarioId: usuarioId,
                [Op.or]: [
                    { horaInicio: { [Op.between]: [horaInicio, horaFin] } },
                    { horaFin: { [Op.between]: [horaInicio, horaFin] } },
                    { [Op.and]: [{ horaInicio: { [Op.lte]: horaInicio } }, { horaFin: { [Op.gte]: horaFin } }] }
                ]
            },
            transaction
        });

        if (citaExistenteUsuario) {
            await transaction.rollback();
            return res.status(400).json({ message: 'El usuario ya tiene una cita en este horario.' });
        }

        const citaExistenteCliente = await Cita.findOne({
            where: {
                id: { [Op.ne]: id },
                clienteId: clienteId,
                [Op.or]: [
                    { horaInicio: { [Op.between]: [horaInicio, horaFin] } },
                    { horaFin: { [Op.between]: [horaInicio, horaFin] } },
                    { [Op.and]: [{ horaInicio: { [Op.lte]: horaInicio } }, { horaFin: { [Op.gte]: horaFin } }] }
                ]
            },
            transaction
        });

        if (citaExistenteCliente) {
            await transaction.rollback();
            return res.status(400).json({ message: 'El cliente ya tiene una cita en este horario.' });
        }

        const cita = await Cita.findByPk(id, { transaction });

        if (!cita) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        await cita.update({
            nombre,
            descripcion,
            tipoCita,
            fecha,
            horaInicio,
            horaFin,
            lugar,
            estado,
            enlace,
            documentos,
            usuarioId,
            clienteId
        }, { transaction });

        // Actualizar disponibilidad del usuario
        if (usuarioId) {
            await Disponibilidad.update({
                fechaInicio: horaInicio,
                fechaFin: horaFin,
                tipo: 'Ocupado'
            }, {
                where: {
                    usuarioId: usuarioId,
                    fechaInicio: cita.horaInicio,
                    fechaFin: cita.horaFin
                },
                transaction
            });
        }

        // Actualizar disponibilidad del cliente
        if (clienteId) {
            await Disponibilidad.update({
                fechaInicio: horaInicio,
                fechaFin: horaFin,
                tipo: 'Ocupado'
            }, {
                where: {
                    clienteId: clienteId,
                    fechaInicio: cita.horaInicio,
                    fechaFin: cita.horaFin
                },
                transaction
            });
        }

        await transaction.commit();
        const citaConDetalles = await Cita.findByPk(cita.id, {
            include: [
                { model: Usuario, include: [Rol] },
                Cliente
            ]
        });
        req.io.emit('citaActualizada', citaConDetalles); // Emitir evento de cita actualizada
        res.status(200).json(citaConDetalles);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Error al actualizar la cita', error: error.message });
    }
};

// Actualizar el estado de una cita
exports.actualizarEstadoCita = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    const transaction = await sequelize.transaction();

    try {
        const cita = await Cita.findByPk(id, { transaction });

        if (!cita) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        await cita.update({ estado }, { transaction });
        await transaction.commit();

        const citaConDetalles = await Cita.findByPk(cita.id, {
            include: [
                { model: Usuario, include: [Rol] },
                Cliente
            ]
        });
        req.io.emit('estadoCitaActualizado', citaConDetalles); // Emitir evento de estado de cita actualizado
        res.status(200).json(citaConDetalles);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Error al actualizar el estado de la cita', error: error.message });
    }
};

// Eliminar una cita
exports.eliminarCita = async (req, res) => {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
        // Eliminar los registros relacionados en participantesCita
        await ParticipantesCita.destroy({
            where: { citaId: id },
            transaction
        });

        // Buscar y eliminar la cita
        const cita = await Cita.findByPk(id, { transaction });

        if (!cita) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        await cita.destroy({ transaction });

        // Eliminar la disponibilidad asociada
        await Disponibilidad.destroy({
            where: { 
                [Op.or]: [
                    { usuarioId: cita.usuarioId, fechaInicio: cita.horaInicio, fechaFin: cita.horaFin },
                    { clienteId: cita.clienteId, fechaInicio: cita.horaInicio, fechaFin: cita.horaFin }
                ]
            },
            transaction
        });

        await transaction.commit();
        req.io.emit('citaEliminada', { id }); // Emitir evento de cita eliminada
        res.status(200).json({ message: 'Cita eliminada' });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Error al eliminar la cita', error: error.message });
    }
};

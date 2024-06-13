const { Tarea, Usuario, Rol, sequelize } = require('../models/relacionesModelos');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

// Crear una nueva tarea
exports.crearTarea = async (req, res) => {
    const { nombre, descripcion, usuarioId, fechaVencimiento, estado } = req.body;
    const t = await sequelize.transaction();

    try {
        // Verificar si el usuario existe
        const usuario = await Usuario.findByPk(usuarioId, { transaction: t });
        if (!usuario) {
            await t.rollback();
            return res.status(400).json({ message: 'El usuario no existe.' });
        }

        // Validar los campos requeridos
        if (!nombre || !fechaVencimiento || !estado) {
            await t.rollback();
            return res.status(400).json({ message: 'Los campos nombre, fecha de vencimiento y estado son obligatorios.' });
        }

        // Validar que la fecha de vencimiento no sea pasada
        const hoy = moment().tz('America/Mexico_City').startOf('day');
        const fechaVencimientoMoment = moment.tz(fechaVencimiento, 'America/Mexico_City').startOf('day');

        if (fechaVencimientoMoment.isBefore(hoy)) {
            await t.rollback();
            return res.status(400).json({ message: 'La fecha de vencimiento no puede ser pasada.' });
        }

        // Crear la tarea
        const tarea = await Tarea.create({
            id: uuidv4(),
            nombre,
            descripcion,
            usuarioId,
            fechaVencimiento: fechaVencimientoMoment.toDate(), // Almacenar en UTC
            estado
        }, { transaction: t });

        await t.commit();

        // Emitir evento de nueva tarea
        const tareaConUsuario = await Tarea.findByPk(tarea.id, {
            include: [{ model: Usuario, include: [Rol] }]
        });
        req.io.to(usuarioId).emit('tareaCreada', tareaConUsuario);

        // Emitir a todos los administradores
        const admins = await Usuario.findAll({ where: { '$Rol.tipo$': 'Administrador' }, include: [Rol] });
        admins.forEach(admin => {
            req.io.to(admin.id).emit('tareaCreada', tareaConUsuario);
        });

        res.status(201).json(tareaConUsuario);
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Error al crear la tarea', error: error.message });
    }
};

// Obtener todas las tareas
exports.obtenerTareas = async (req, res) => {
    const { userId } = req.session;
    try {
        const usuario = await Usuario.findByPk(userId, { include: [Rol] });
        let where = {};

        if (usuario.Rol.tipo !== 'Administrador') {
            where = { usuarioId: userId };
        }

        const tareas = await Tarea.findAll({
            where,
            include: [
                {
                    model: Usuario,
                    include: [Rol]
                }
            ]
        });
        res.status(200).send(tareas);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener las tareas', error: error.message });
    }
};

// Obtener una tarea por ID
exports.obtenerTareaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const tarea = await Tarea.findByPk(id, {
            include: [
                { model: Usuario, include: [Rol] }
            ]
        });

        if (!tarea) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        res.status(200).json(tarea);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la tarea', error: error.message });
    }
};

// Actualizar una tarea
exports.actualizarTarea = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, usuarioId, fechaVencimiento, estado } = req.body;
    const t = await sequelize.transaction();

    try {
        // Verificar si el usuario existe
        const usuario = await Usuario.findByPk(usuarioId, { transaction: t });
        if (!usuario) {
            await t.rollback();
            return res.status(400).json({ message: 'El usuario no existe.' });
        }

        // Validar los campos requeridos
        if (!nombre || !fechaVencimiento || !estado) {
            await t.rollback();
            return res.status(400).json({ message: 'Los campos nombre, fecha de vencimiento y estado son obligatorios.' });
        }

        // Validar que la fecha de vencimiento no sea en el pasado
        const hoy = moment().tz('America/Mexico_City').startOf('day');
        const fechaVencimientoMoment = moment.tz(fechaVencimiento, 'America/Mexico_City').startOf('day');

        if (fechaVencimientoMoment.isBefore(hoy)) {
            await t.rollback();
            return res.status(400).json({ message: 'La fecha de vencimiento no puede ser en el pasado.' });
        }

        const tarea = await Tarea.findByPk(id, { transaction: t });
        if (!tarea) {
            await t.rollback();
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        await tarea.update({
            nombre,
            descripcion,
            usuarioId,
            fechaVencimiento: fechaVencimientoMoment.toDate(), // Almacenar en UTC
            estado
        }, { transaction: t });

        await t.commit();

        // Emitir evento de tarea actualizada
        const tareaConUsuario = await Tarea.findByPk(tarea.id, {
            include: [{ model: Usuario, include: [Rol] }]
        });
        req.io.to(tarea.usuarioId).emit('tareaActualizada', tareaConUsuario);

        // Emitir a todos los administradores
        const admins = await Usuario.findAll({ where: { '$Rol.tipo$': 'Administrador' }, include: [Rol] });
        admins.forEach(admin => {
            req.io.to(admin.id).emit('tareaActualizada', tareaConUsuario);
        });

        res.status(200).json(tareaConUsuario);
    } catch (error) {
        if (t.finished !== 'commit') {
            await t.rollback();
        }
        console.error('Error al actualizar la tarea:', error);
        res.status(500).json({ message: 'Error al actualizar la tarea', error: error.message });
    }
};

// Actualizar el estado de una tarea
exports.actualizarEstadoTarea = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    const t = await sequelize.transaction();

    try {
        const tarea = await Tarea.findByPk(id, { transaction: t, include: [{ model: Usuario, include: [Rol] }] });

        if (!tarea) {
            await t.rollback();
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        await tarea.update({
            estado
        }, { transaction: t });

        await t.commit();

        // Emitir evento de estado de tarea actualizado
        const tareaConUsuario = await Tarea.findByPk(tarea.id, {
            include: [{ model: Usuario, include: [Rol] }]
        });
        req.io.to(tarea.usuarioId).emit('estadoTareaActualizado', tareaConUsuario);

        // Emitir a todos los administradores
        const admins = await Usuario.findAll({ where: { '$Rol.tipo$': 'Administrador' }, include: [Rol] });
        admins.forEach(admin => {
            req.io.to(admin.id).emit('estadoTareaActualizado', tareaConUsuario);
        });

        res.status(200).json(tareaConUsuario);
    } catch (error) {
        if (t.finished !== 'commit') {
            await t.rollback();
        }
        console.error('Error al actualizar el estado de la tarea:', error);
        res.status(500).json({ message: 'Error al actualizar el estado de la tarea', error: error.message });
    }
};

// Eliminar una tarea
exports.eliminarTarea = async (req, res) => {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
        const tarea = await Tarea.findByPk(id, { transaction: t });

        if (!tarea) {
            await t.rollback();
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        await tarea.destroy({ transaction: t });
        await t.commit();

        // Emitir evento de tarea eliminada
        req.io.to(tarea.usuarioId).emit('tareaEliminada', { id });

        // Emitir a todos los administradores
        const admins = await Usuario.findAll({ where: { '$Rol.tipo$': 'Administrador' }, include: [Rol] });
        admins.forEach(admin => {
            req.io.to(admin.id).emit('tareaEliminada', { id });
        });

        res.status(200).json({ message: 'Tarea eliminada' });
    } catch (error) {
        if (t.finished !== 'commit') {
            await t.rollback();
        }
        console.error('Error al eliminar la tarea:', error);
        res.status(500).json({ message: 'Error al eliminar la tarea', error: error.message });
    }
};

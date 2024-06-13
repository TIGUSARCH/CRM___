// controllers/disponibilidadController.js
const { Cita, Disponibilidad } = require('../models/relacionesModelos');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

// Función para obtener citas por fecha
const obtenerCitasPorFecha = async (fecha, usuarioId, clienteId) => {
    const inicioDelDia = moment(fecha).startOf('day').toDate();
    const finDelDia = moment(fecha).endOf('day').toDate();

    const whereCondition = {
        fecha: {
            [Op.between]: [inicioDelDia, finDelDia]
        }
    };

    if (usuarioId) {
        whereCondition.usuarioId = usuarioId;
    }

    if (clienteId) {
        whereCondition.clienteId = clienteId;
    }

    const citas = await Cita.findAll({
        where: whereCondition,
        order: [['horaInicio', 'ASC']]
    });

    return citas;
};

// Función para calcular disponibilidad
const calcularDisponibilidad = (citas, horaInicioDia, horaFinDia) => {
    const disponibilidad = [];
    let inicioLibre = moment(horaInicioDia);

    citas.forEach(cita => {
        const inicioCita = moment(cita.horaInicio);
        const finCita = moment(cita.horaFin);

        if (inicioLibre.isBefore(inicioCita)) {
            disponibilidad.push({
                horaInicio: inicioLibre.format('HH:mm'),
                horaFin: inicioCita.format('HH:mm')
            });
        }

        inicioLibre = finCita;
    });

    if (inicioLibre.isBefore(horaFinDia)) {
        disponibilidad.push({
            horaInicio: inicioLibre.format('HH:mm'),
            horaFin: moment(horaFinDia).format('HH:mm')
        });
    }

    return disponibilidad;
};

// Crear una nueva disponibilidad con validación detallada
exports.crearDisponibilidad = async (req, res) => {
    const { usuarioId, clienteId, fechaInicio, fechaFin, tipo } = req.body;
    if (!fechaInicio || !fechaFin || !tipo) {
        return res.status(400).send({ message: 'Fechas de inicio y fin, y tipo son obligatorios.' });
    }

    try {
        const nuevaDisponibilidad = await Disponibilidad.create({ usuarioId, clienteId, fechaInicio, fechaFin, tipo });
        req.io.emit('disponibilidadCreada', nuevaDisponibilidad); // Emitir evento de creación
        res.status(201).send(nuevaDisponibilidad);
    } catch (error) {
        res.status(500).send({ message: 'Error al crear la disponibilidad', error: error.message });
    }
};

// Obtener toda la disponibilidad con soporte para paginación y filtro
exports.obtenerDisponibilidad = async (req, res) => {
    try {
        const { pagina, tamano, tipo } = req.query;
        const limit = tamano ? +tamano : 10;
        const offset = pagina ? pagina * limit : 0;

        const condiciones = tipo ? { tipo: { [Op.iLike]: `%${tipo}%` } } : {};

        const disponibilidad = await Disponibilidad.findAndCountAll({
            where: condiciones,
            limit,
            offset,
            order: [['fechaInicio', 'ASC']]
        });

        res.status(200).send({
            total: disponibilidad.count,
            data: disponibilidad.rows
        });
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener la disponibilidad', error: error.message });
    }
};

// Obtener una disponibilidad por ID con manejo de errores
exports.obtenerDisponibilidadPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const disponibilidad = await Disponibilidad.findByPk(id);
        if (!disponibilidad) {
            return res.status(404).send({ message: 'Disponibilidad no encontrada.' });
        }
        res.status(200).send(disponibilidad);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener la disponibilidad', error: error.message });
    }
};

// Actualizar una disponibilidad con validación
exports.actualizarDisponibilidad = async (req, res) => {
    const { id } = req.params;
    const { usuarioId, clienteId, fechaInicio, fechaFin, tipo } = req.body;

    try {
        const disponibilidad = await Disponibilidad.findByPk(id);
        if (!disponibilidad) {
            return res.status(404).send({ message: 'Disponibilidad no encontrada.' });
        }

        disponibilidad.usuarioId = usuarioId || disponibilidad.usuarioId;
        disponibilidad.clienteId = clienteId || disponibilidad.clienteId;
        disponibilidad.fechaInicio = fechaInicio || disponibilidad.fechaInicio;
        disponibilidad.fechaFin = fechaFin || disponibilidad.fechaFin;
        disponibilidad.tipo = tipo || disponibilidad.tipo;

        await disponibilidad.save();

        req.io.emit('disponibilidadActualizada', disponibilidad); // Emitir evento de actualización
        res.status(200).send(disponibilidad);
    } catch (error) {
        res.status(500).send({ message: 'Error al actualizar la disponibilidad', error: error.message });
    }
};

// Eliminar una disponibilidad
exports.eliminarDisponibilidad = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Disponibilidad.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).send({ message: 'Disponibilidad no encontrada para eliminar.' });
        }
        req.io.emit('disponibilidadEliminada', { id }); // Emitir evento de eliminación
        res.status(200).send({ message: 'Disponibilidad eliminada exitosamente.' });
    } catch (error) {
        res.status(500).send({ message: 'Error al eliminar la disponibilidad', error: error.message });
    }
};

// Endpoint para obtener disponibilidad de horarios
exports.obtenerDisponibilidadHorarios = async (req, res) => {
    const { fecha, usuarioId, clienteId, horaInicioDia, horaFinDia, tipo } = req.query;

    try {
        // Obtener citas existentes
        const citas = await obtenerCitasPorFecha(fecha, usuarioId, clienteId);

        if (tipo === 'ocupado') {
            // Devuelve solo los horarios ocupados
            const ocupados = citas.map(cita => ({
                horaInicio: moment(cita.horaInicio).format('HH:mm'),
                horaFin: moment(cita.horaFin).format('HH:mm')
            }));
            return res.status(200).json(ocupados);
        } else {
            // Definir el inicio y fin del día
            const inicioDelDia = moment(`${fecha} ${horaInicioDia}`, 'YYYY-MM-DD HH:mm').toDate();
            const finDelDia = moment(`${fecha} ${horaFinDia}`, 'YYYY-MM-DD HH:mm').toDate();

            // Calcular disponibilidad
            const disponibilidad = calcularDisponibilidad(citas, inicioDelDia, finDelDia);
            return res.status(200).json(disponibilidad);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la disponibilidad', error: error.message });
    }
};

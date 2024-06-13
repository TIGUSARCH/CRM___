// controllers/participantesCitasController.js
const ParticipantesCita = require('../models/participantesCita');
const { Op } = require('sequelize');

// Añadir un participante a una cita con validación detallada
exports.agregarParticipante = async (req, res) => {
    const { citaId, usuarioId, clienteId } = req.body;
    if (!citaId || (!usuarioId && !clienteId)) {
        return res.status(400).send({ message: 'ID de cita y al menos uno de usuario o cliente son obligatorios.' });
    }

    try {
        const nuevoParticipante = await ParticipantesCita.create({ citaId, usuarioId, clienteId });
        res.status(201).send(nuevoParticipante);
    } catch (error) {
        res.status(500).send({ message: 'Error al añadir el participante a la cita', error: error.message });
    }
};

// Obtener todos los participantes de citas con soporte para paginación y filtro
exports.obtenerParticipantes = async (req, res) => {
    try {
        const { pagina, tamano, citaId } = req.query;
        const limit = tamano ? +tamano : 10;
        const offset = pagina ? pagina * limit : 0;

        const condiciones = citaId ? { citaId: { [Op.iLike]: `%${citaId}%` } } : {};

        const participantes = await ParticipantesCita.findAndCountAll({
            where: condiciones,
            limit,
            offset,
            order: [['citaId', 'ASC']]
        });

        res.status(200).send({
            total: participantes.count,
            data: participantes.rows
        });
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener los participantes de citas', error: error.message });
    }
};

// Obtener un participante de cita por ID con manejo de errores
exports.obtenerParticipantePorId = async (req, res) => {
    const { id } = req.params;
    try {
        const participante = await ParticipantesCita.findByPk(id);
        if (!participante) {
            return res.status(404).send({ message: 'Participante de cita no encontrado.' });
        }
        res.status(200).send(participante);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener el participante de cita', error: error.message });
    }
};

// Actualizar un participante de cita con validación
exports.actualizarParticipante = async (req, res) => {
    const { id } = req.params;
    const { citaId, usuarioId, clienteId } = req.body;

    try {
        const participante = await ParticipantesCita.findByPk(id);
        if (!participante) {
            return res.status(404).send({ message: 'Participante de cita no encontrado.' });
        }

        participante.citaId = citaId || participante.citaId;
        participante.usuarioId = usuarioId || participante.usuarioId;
        participante.clienteId = clienteId || participante.clienteId;

        await participante.save();

        res.status(200).send(participante);
    } catch (error) {
        res.status(500).send({ message: 'Error al actualizar el participante de cita', error: error.message });
    }
};

// Eliminar un participante de cita
exports.eliminarParticipante = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await ParticipantesCita.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).send({ message: 'Participante de cita no encontrado para eliminar.' });
        }
        res.status(200).send({ message: 'Participante de cita eliminado exitosamente.' });
    } catch (error) {
        res.status(500).send({ message: 'Error al eliminar el participante de cita', error: error.message });
    }
};

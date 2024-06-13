// controllers/documentosController.js
const Documento = require('../models/documento');
const { Op } = require('sequelize');

// Crear un nuevo documento con validación detallada
exports.crearDocumento = async (req, res) => {
    const { nombre, tipo, contenido, eventoId } = req.body;
    if (!nombre || !eventoId) {
        return res.status(400).send({ message: 'Nombre y evento son obligatorios.' });
    }

    try {
        const nuevoDocumento = await Documento.create({ nombre, tipo, contenido, eventoId });
        res.status(201).send(nuevoDocumento);
    } catch (error) {
        res.status(500).send({ message: 'Error al crear el documento', error: error.message });
    }
};

// Obtener todos los documentos con soporte para paginación y filtro
exports.obtenerDocumentos = async (req, res) => {
    try {
        const { pagina, tamano, nombre } = req.query;
        const limit = tamano ? +tamano : 10;
        const offset = pagina ? pagina * limit : 0;

        const condiciones = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : {};

        const documentos = await Documento.findAndCountAll({
            where: condiciones,
            limit,
            offset,
            order: [['nombre', 'ASC']]
        });

        res.status(200).send({
            total: documentos.count,
            data: documentos.rows
        });
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener los documentos', error: error.message });
    }
};

// Obtener un documento por ID con manejo de errores
exports.obtenerDocumentoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const documento = await Documento.findByPk(id);
        if (!documento) {
            return res.status(404).send({ message: 'Documento no encontrado.' });
        }
        res.status(200).send(documento);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener el documento', error: error.message });
    }
};

// Actualizar un documento con validación
exports.actualizarDocumento = async (req, res) => {
    const { id } = req.params;
    const { nombre, tipo, contenido, eventoId } = req.body;

    try {
        const documento = await Documento.findByPk(id);
        if (!documento) {
            return res.status(404).send({ message: 'Documento no encontrado.' });
        }

        documento.nombre = nombre || documento.nombre;
        documento.tipo = tipo || documento.tipo;
        documento.contenido = contenido || documento.contenido;
        documento.eventoId = eventoId || documento.eventoId;

        await documento.save();

        res.status(200).send(documento);
    } catch (error) {
        res.status(500).send({ message: 'Error al actualizar el documento', error: error.message });
    }
};

// Eliminar un documento
exports.eliminarDocumento = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Documento.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).send({ message: 'Documento no encontrado para eliminar.' });
        }
        res.status(200).send({ message: 'Documento eliminado exitosamente.' });
    } catch (error) {
        res.status(500).send({ message: 'Error al eliminar el documento', error: error.message });
    }
};

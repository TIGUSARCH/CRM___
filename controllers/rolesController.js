// controllers/rolesController.js
const Rol = require('../models/rol');

// Crear un nuevo rol con validación detallada
exports.crearRol = async (req, res) => {
    const { tipo, permisos } = req.body;
    if (!tipo) {
        return res.status(400).send({ message: 'El tipo de rol es obligatorio.' });
    }

    try {
        const nuevoRol = await Rol.create({ tipo, permisos });
        res.status(201).send(nuevoRol);
    } catch (error) {
        res.status(500).send({ message: 'Error al crear el rol', error: error.message });
    }
};

// Obtener todos los roles
exports.obtenerRoles = async (req, res) => {
    try {
        const roles = await Rol.findAll();
        res.status(200).send(roles);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener los roles', error: error.message });
    }
};

// Obtener un rol por ID con manejo de errores
exports.obtenerRolPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const rol = await Rol.findByPk(id);
        if (!rol) {
            return res.status(404).send({ message: 'Rol no encontrado.' });
        }
        res.status(200).send(rol);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener el rol', error: error.message });
    }
};

// Actualizar un rol con validación
exports.actualizarRol = async (req, res) => {
    const { id } = req.params;
    const { tipo, permisos } = req.body;

    try {
        const rol = await Rol.findByPk(id);
        if (!rol) {
            return res.status(404).send({ message: 'Rol no encontrado.' });
        }

        rol.tipo = tipo || rol.tipo;
        rol.permisos = permisos || rol.permisos;

        await rol.save();

        res.status(200).send(rol);
    } catch (error) {
        res.status(500).send({ message: 'Error al actualizar el rol', error: error.message });
    }
};

// Eliminar un rol
exports.eliminarRol = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Rol.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).send({ message: 'Rol no encontrado para eliminar.' });
        }
        res.status(200).send({ message: 'Rol eliminado exitosamente.' });
    } catch (error) {
        res.status(500).send({ message: 'Error al eliminar el rol', error: error.message });
    }
};

// controllers/usuariosController.js
const { Usuario, Rol } = require('../models/relacionesModelos');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

// Crear un nuevo usuario con validación detallada
exports.crearUsuario = async (req, res) => {
    const { nombre, apellidoPaterno, apellidoMaterno, telefono, imagen, correoElectronico, contrasena, rolId } = req.body;
    if (!nombre || !correoElectronico || !contrasena || !rolId) {
        return res.status(400).send({ message: 'Nombre, correo electrónico, contraseña y rol son obligatorios.' });
    }

    try {
        const usuarioExistente = await Usuario.findOne({ where: { correoElectronico } });
        if (usuarioExistente) {
            return res.status(409).send({ message: 'El correo electrónico ya está registrado.' });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        const nuevoUsuario = await Usuario.create({
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            telefono,
            imagen,
            correoElectronico,
            contrasena: hashedPassword,
            rolId
        });

        const usuarioConRol = await Usuario.findByPk(nuevoUsuario.id, { include: [Rol] });

        res.status(201).send(usuarioConRol);
    } catch (error) {
        res.status(500).send({ message: 'Error al crear el usuario', error: error.message });
    }
};

// Obtener todos los usuarios con soporte para paginación y filtro
exports.obtenerUsuarios = async (req, res) => {
    try {
        const { pagina, tamano, nombre } = req.query;
        const limit = tamano ? +tamano : 10;
        const offset = pagina ? pagina * limit : 0;

        const condiciones = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : {};

        const usuarios = await Usuario.findAndCountAll({
            where: condiciones,
            limit,
            offset,
            order: [['nombre', 'ASC']],
            include: [Rol]
        });

        res.status(200).send({
            total: usuarios.count,
            data: usuarios.rows
        });
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener los usuarios', error: error.message });
    }
};

// Obtener un usuario por ID con manejo de errores
exports.obtenerUsuarioPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const usuario = await Usuario.findByPk(id, {
            include: [Rol]
        });
        if (!usuario) {
            return res.status(404).send({ message: 'Usuario no encontrado.' });
        }
        res.status(200).send(usuario);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener el usuario', error: error.message });
    }
};

// Actualizar un usuario con validación
exports.actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellidoPaterno, apellidoMaterno, telefono, imagen, correoElectronico, rolId } = req.body;

    try {
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).send({ message: 'Usuario no encontrado.' });
        }

        usuario.nombre = nombre || usuario.nombre;
        usuario.apellidoPaterno = apellidoPaterno || usuario.apellidoPaterno;
        usuario.apellidoMaterno = apellidoMaterno || usuario.apellidoMaterno;
        usuario.telefono = telefono || usuario.telefono;
        usuario.imagen = imagen || usuario.imagen;
        usuario.correoElectronico = correoElectronico || usuario.correoElectronico;
        usuario.rolId = rolId || usuario.rolId;

        await usuario.save();

        const usuarioConRol = await Usuario.findByPk(usuario.id, { include: [Rol] });

        res.status(200).send(usuarioConRol);
    } catch (error) {
        res.status(500).send({ message: 'Error al actualizar el usuario', error: error.message });
    }
};

// Eliminar un usuario
exports.eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Usuario.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).send({ message: 'Usuario no encontrado para eliminar.' });
        }
        res.status(200).send({ message: 'Usuario eliminado exitosamente.' });
    } catch (error) {
        res.status(500).send({ message: 'Error al eliminar el usuario', error: error.message });
    }
};

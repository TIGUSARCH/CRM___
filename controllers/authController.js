const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');

// authController.js
exports.login = async (req, res) => {
    const { correoElectronico, contrasena } = req.body;

    //!AY QUE AGREGAR ESTE CODIGO EN VERSION FINAL-INICO
    //*VALIDACION DE CAMPOS VACIOS
    if (!correoElectronico || !contrasena) {
        return res.status(400).send({ message: 'Debes llenar ambos campos'});
    }
    //!AY QUE AGREGAR ESTE CODIGO EN VERSION FINAL-FIN
    try {
        const usuario = await Usuario.findOne({ where: { correoElectronico } });
        if (!usuario) {
            return res.status(401).json({ message: 'El usuario no existe' });
        }

        const esValido = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!esValido) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        req.session.userId = usuario.id; // Guardar el ID del usuario en la sesión
        req.session.save(() => {
            res.json({ message: 'Inicio de sesión exitoso', userId: usuario.id});
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
};

// Añadir el logout también aquí por consistencia
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error al cerrar sesión', error: err.message });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Cierre de sesión exitoso' });
    });
};

// middlewares/authMiddleware.js
const { Usuario, Rol } = require('../models/relacionesModelos');

module.exports = (requiredRoles) => {
    return async (req, res, next) => {
        if (!req.session.userId) {
            // Redirigir a la página de inicio de sesión si no está autenticado
            return res.redirect('/login');
        }

        try {
            const usuario = await Usuario.findByPk(req.session.userId, {
                include: [{ model: Rol }]
            });

            if (!usuario) {
                // Redirigir a la página de inicio de sesión si el usuario no es encontrado
                return res.redirect('/login');
            }

            if (requiredRoles && !requiredRoles.includes(usuario.Rol.tipo)) {
                return res.status(403).json({ message: 'No tiene permiso para acceder a este recurso' });
            }

            req.usuario = usuario;
            next();
        } catch (error) {
            res.status(500).json({ message: 'Error de servidor', error: error.message });
        }
    };
};

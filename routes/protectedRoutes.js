// routes/protectedRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

/* En teoria desde aqui podríamos iniciar sesión, POSTMAN va a guardar la cookie de lasesión
y cuando hagamos un GET a alguna de estas rutas nos deberá dar acceso si es que somos ADMIN */

// Ruta protegida solo para administradores - GET
router.get('/admin', authMiddleware(['Administrador']), (req, res) => {
    res.status(200).json({ message: 'Acceso autorizado para administradores' });
});

// Ruta protegida solo para administradores - POST
router.post('/admin', authMiddleware(['Administrador']), (req, res) => {
    const { data } = req.body;
    res.status(200).json({ message: 'Datos recibidos', data });
});

// Ruta protegida para usuarios y administradores - GET
router.get('/user', authMiddleware(['Usuario', 'Administrador']), (req, res) => {
    res.status(200).json({ message: 'Acceso autorizado para usuarios y administradores' });
});

// Ruta protegida para colaboradores y administradores - GET
router.get('/colaborador', authMiddleware(['Colaborador', 'Administrador']), (req, res) => {
    res.status(200).json({ message: 'Acceso autorizado para colaboradores y administradores' });
});




module.exports = router;

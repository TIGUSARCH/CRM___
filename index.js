const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const http = require('http');
const session = require('express-session');
const socketIo = require('socket.io');
const sharedsession = require('express-socket.io-session');
const { configureSocketIO } = require('./socket');

dotenv.config();


// Importar configuración de base de datos y asociaciones
const sequelize = require('./config/db');
require('./models/relacionesModelos');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Configurar express-session
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Usar true en producción con HTTPS
});

app.use(sessionMiddleware);

// Compartir la sesión entre Express y Socket.IO
io.use(sharedsession(sessionMiddleware, {
    autoSave: true
}));

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ mensaje: 'Ocurrió un error en el servidor.' });
});

// Middleware de registro de solicitudes con IP
/* app.use((req, res, next) => {
    const ip = req.ip; // Obtener la IP del cliente
    console.log(`${req.method} ${req.url} - IP: ${ip}`);
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${res.statusCode}] ${req.method} ${req.url} - IP: ${ip} - ${duration}ms`);
    });
    next();
}); */
 

// Middleware para compartir io con los controladores
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('views', path.join(__dirname, 'dist'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'dist')));

// Rutas
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/protected', require('./routes/protectedRoutes')); // rutas protegidas

// Configurar Socket.IO
configureSocketIO(io);

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
        await sequelize.sync({ force: false }); // force: true para desarrollo, force: false para producción
        console.log('Todos los modelos fueron sincronizados correctamente.');
        server.listen(PORT, () => { // Cambiado de app.listen a server.listen
            console.log(`Server listening on PORT ${PORT}`);
        });
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
}

startServer();

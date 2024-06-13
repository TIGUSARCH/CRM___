// socket.js
const { Tarea, Usuario, Cita, Cliente, Rol, Evento, Disponibilidad } = require('./models/relacionesModelos');

function configureSocketIO(io) {
    io.on('connection', (socket) => {
        const session = socket.handshake.session;

        if (!session || !session.userId) {
            console.log('Usuario no autenticado intentando conectar:', socket.id);
            socket.disconnect();
            return;
        }

        const userId = session.userId;
        console.log(`Un cliente se ha conectado: ${socket.id}, User ID: ${userId}`);

        socket.join(userId);
        console.log(`Cliente ${socket.id} se unió a la sala ${userId}`);

        socket.on('joinRoom', async () => {
            try {
                const usuario = await Usuario.findByPk(userId, {
                    include: [Rol]
                });

                if (usuario) {
                    console.log('Detalles del usuario:', usuario.toJSON());
                    socket.emit('joinedRoom', `Te has unido a la sala ${userId}`);
                } else {
                    console.log(`Usuario con ID ${userId} no encontrado.`);
                    socket.emit('error', `Usuario con ID ${userId} no encontrado.`);
                }

                // Emitir solo las tareas del usuario o todas si es administrador
                let whereClause = usuario.Rol.tipo === 'Administrador' ? {} : { usuarioId: userId };
                const tareas = await Tarea.findAll({
                    where: whereClause,
                    include: [{ model: Usuario, include: [Rol] }]
                });
                io.to(userId).emit('tareas', tareas);

                // Emitir solo las citas del usuario o todas si es administrador
                const citas = await Cita.findAll({
                    where: whereClause,
                    include: [{ model: Usuario, include: [Rol] }, { model: Cliente }]
                });
                io.to(userId).emit('citas', citas);

                // Emitir todos los eventos 
                const eventos = await Evento.findAll({
                    include: Usuario
                });
                io.to(userId).emit('eventos', eventos);

                // Emitir disponibilidad 
                const disponibilidad = await Disponibilidad.findAll();
                io.to(userId).emit('disponibilidad', disponibilidad);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Un cliente se ha desconectado:', socket.id);
        });
    });
}

module.exports = { configureSocketIO };

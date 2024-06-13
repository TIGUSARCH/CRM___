// models/relacionesModelos.js

const sequelize = require('../config/db'); // Importar sequelize
const Usuario = require('./usuario');
const Cliente = require('./cliente');
const Rol = require('./rol');
const Evento = require('./evento');
const Tarea = require('./tarea');
const Cita = require('./cita');
const Documento = require('./documento');
const ParticipantesCita = require('./participantesCita');
const Disponibilidad = require('./disponibilidad'); // Importar Disponibilidad

// Usuarios y Roles
Usuario.belongsTo(Rol, { foreignKey: 'rolId' });
Rol.hasMany(Usuario, { foreignKey: 'rolId' });

// Usuarios y Eventos
Evento.belongsTo(Usuario, { foreignKey: 'creadorId' });
Usuario.hasMany(Evento, { foreignKey: 'creadorId' });

// Usuarios y Tareas
Tarea.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Usuario.hasMany(Tarea, { foreignKey: 'usuarioId' });

// Eventos y Documentos
Documento.belongsTo(Evento, { foreignKey: 'eventoId' });
Evento.hasMany(Documento, { foreignKey: 'eventoId' });

// Citas y Usuarios
Cita.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Usuario.hasMany(Cita, { foreignKey: 'usuarioId' });

// Citas y Clientes
Cita.belongsTo(Cliente, { foreignKey: 'clienteId' });
Cliente.hasMany(Cita, { foreignKey: 'clienteId' });

// Citas y Participantes
ParticipantesCita.belongsTo(Cita, { foreignKey: 'citaId' });
Cita.hasMany(ParticipantesCita, { foreignKey: 'citaId' });
ParticipantesCita.belongsTo(Usuario, { foreignKey: 'usuarioId' });
ParticipantesCita.belongsTo(Cliente, { foreignKey: 'clienteId' });

// Disponibilidad
Disponibilidad.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Disponibilidad.belongsTo(Cliente, { foreignKey: 'clienteId' });

module.exports = {
    Usuario,
    Cliente,
    Rol,
    Evento,
    Tarea,
    Cita,
    Documento,
    ParticipantesCita,
    Disponibilidad,
    sequelize
};

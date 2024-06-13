// models/participantesCita.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ParticipantesCita = sequelize.define('ParticipantesCita', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    citaId: {
        type: DataTypes.UUID,
        references: {
            model: 'citas',
            key: 'id'
        }
    },
    usuarioId: {
        type: DataTypes.UUID,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    clienteId: {
        type: DataTypes.UUID,
        references: {
            model: 'clientes',
            key: 'id'
        }
    }
}, {
    tableName: 'participantesCita',
    timestamps: false
});

module.exports = ParticipantesCita;

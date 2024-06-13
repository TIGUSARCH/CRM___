const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Evento = sequelize.define('Evento', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT
    },
    categoria: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.STRING
    },
    fechaInicio: {
        type: DataTypes.DATE
    },
    fechaFin: {
        type: DataTypes.DATE
    },
    tipo: {
        type: DataTypes.STRING
    },
    creadorId: {
        type: DataTypes.UUID,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    }
}, {
    tableName: 'eventos',
    timestamps: true
});

module.exports = Evento;

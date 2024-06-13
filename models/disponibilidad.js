// models/disponibilidad.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Disponibilidad = sequelize.define('Disponibilidad', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    usuarioId: {
        type: DataTypes.UUID,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        allowNull: true
    },
    clienteId: {
        type: DataTypes.UUID,
        references: {
            model: 'clientes',
            key: 'id'
        },
        allowNull: true
    },
    fechaInicio: {
        type: DataTypes.DATE,
        allowNull: false
    },
    fechaFin: {
        type: DataTypes.DATE,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false // Ejemplos: "Disponible", "Ocupado", "Reservado"
    }
}, {
    tableName: 'disponibilidad',
    timestamps: false
});

module.exports = Disponibilidad;

// models/cita.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Cita = sequelize.define('Cita', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING
    },
    tipoCita: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false
    },
    horaInicio: {
        type: DataTypes.DATE,
        allowNull: false
    },
    horaFin: {
        type: DataTypes.DATE,
        allowNull: false
    },
    lugar: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Pendiente'
    },
    enlace: {
        type: DataTypes.STRING,
        allowNull: true
    },
    documentos: {
        type: DataTypes.STRING
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
    tableName: 'citas',
    timestamps: true
});

module.exports = Cita;

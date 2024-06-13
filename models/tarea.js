const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tarea = sequelize.define('Tarea', {
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
        type: DataTypes.TEXT
    },
    usuarioId: {
        type: DataTypes.UUID,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    fechaVencimiento: {
        type: DataTypes.DATE
    },
    estado: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'tareas',
    timestamps: true
});

module.exports = Tarea;

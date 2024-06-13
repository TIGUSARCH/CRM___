const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Documento = sequelize.define('Documento', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING
    },
    contenido: {
        type: DataTypes.TEXT
    },
    eventoId: {
        type: DataTypes.UUID,
        references: {
            model: 'eventos',
            key: 'id'
        }
    }
}, {
    tableName: 'documentos',
    timestamps: true
});

module.exports = Documento;

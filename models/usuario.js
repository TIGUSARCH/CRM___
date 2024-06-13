const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellidoPaterno: {
        type: DataTypes.STRING
    },
    apellidoMaterno: {
        type: DataTypes.STRING
    },
    telefono: {
        type: DataTypes.STRING
    },
    imagen: {
        type: DataTypes.STRING
    },
    correoElectronico: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    contrasena: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rolId: {
        type: DataTypes.UUID,
        references: {
            model: 'roles',
            key: 'id'
        }
    }
}, {
    tableName: 'usuarios',
    timestamps: true
});

module.exports = Usuario;

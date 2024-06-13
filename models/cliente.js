const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cliente = sequelize.define('Cliente', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellidoMaterno: {
        type: DataTypes.STRING
    },
    apellidoPaterno: {
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
    }
}, {
    tableName: 'clientes',
    timestamps: true
});

module.exports = Cliente;

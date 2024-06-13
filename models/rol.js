const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Rol = sequelize.define('Rol', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    permisos: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'roles',
    timestamps: false
});

module.exports = Rol;

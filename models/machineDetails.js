const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MachineDetail = sequelize.define('MachineDetail', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    parts: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    images: {
        type: DataTypes.JSON,
    },
    totalValue: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    documents: {
        type: DataTypes.STRING,
    },
    docDevolution: {
        type: DataTypes.STRING,
    },
    docOrder: {
        type: DataTypes.STRING,
    },
    machineId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Machines',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        primaryKey: true,
    }
}, {
    tableName: 'MachineDetails',
    timestamps: true
});

module.exports = MachineDetail;

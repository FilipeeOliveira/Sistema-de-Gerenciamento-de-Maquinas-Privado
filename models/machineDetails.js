const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MachineDetail = sequelize.define('MachineDetail', {
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    parts: {
        type: DataTypes.JSON,
        allowNull: false,
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
    machineId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Machines',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    }
}, {
    tableName: 'MachineDetails'
});

module.exports = MachineDetail;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MachineLog = sequelize.define('MachineLog', {
    machineId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Machines',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    previousStatus: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    newStatus: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    changeDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'MachineLogs',
    timestamps: false,
});

module.exports = MachineLog;

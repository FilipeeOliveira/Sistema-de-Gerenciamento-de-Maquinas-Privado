const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const LogMachine = require('./logMachine.js');

const Machine = sequelize.define('Machine', {
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    client: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
        /* get() {
            const rawValue = this.getDataValue('images');
            return rawValue ? rawValue.split(',') : [];
        },
        set(value) {
            if (Array.isArray(value)) {
                this.setDataValue('images', value.join(','));
            } else {
                this.setDataValue('images', value);
            }
        }, */
    },
    tags: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('tags');
            return rawValue ? rawValue.split(',') : [];
        },
        set(value) {
            if (Array.isArray(value)) {
                this.setDataValue('tags', value.join(','));
            } else {
                this.setDataValue('tags', value);
            }
        },
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'Machines',
    timestamps: true
});

Machine.hasMany(LogMachine, {
    foreignKey: 'machineId',
    onDelete: 'CASCADE',
});

LogMachine.belongsTo(Machine, {
    foreignKey: 'machineId',
    onDelete: 'CASCADE',
});

module.exports = Machine;

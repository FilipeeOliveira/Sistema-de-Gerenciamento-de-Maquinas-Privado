const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('images');
            return rawValue ? rawValue.split(',') : [];
        },
        set(value) {
            if (Array.isArray(value)) {
                this.setDataValue('images', value.join(','));
            } else {
                this.setDataValue('images', value);
            }
        },
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
    timestamps: true,
});

module.exports = Machine;
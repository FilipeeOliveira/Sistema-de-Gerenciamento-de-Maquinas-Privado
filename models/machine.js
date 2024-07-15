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
        type: DataTypes.STRING, // Armazenar URLs das imagens como string separada por vírgula
        allowNull: true,  // Permitir que seja nulo se necessário
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
        type: DataTypes.STRING, // Armazenar tags como string separada por vírgula
        allowNull: true,  // Permitir que seja nulo se necessário
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
    timestamps: true, // Adicionar timestamps de criação e atualização
});

module.exports = Machine;
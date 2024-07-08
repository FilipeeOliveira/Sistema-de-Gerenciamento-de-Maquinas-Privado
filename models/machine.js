const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Machine = sequelize.define('Machine', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    client: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    images: {
        type: DataTypes.STRING, // Armazenar URLs das imagens como string separada por vírgula
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('images');
            return rawValue ? rawValue.split(',') : [];
        },
        set(value) {
            this.setDataValue('images', value.join(','));
        },
    },
    tags: {
        type: DataTypes.STRING, // Armazenar tags como string separada por vírgula
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('tags');
            return rawValue ? rawValue.split(',') : [];
        },
        set(value) {
            this.setDataValue('tags', value.join(','));
        },
    },
    status: {
        type: DataTypes.STRING,
            allowNull: false,
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




/* const { DataTypes } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    const Machine = sequelize.define('Machine', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        client: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        images:{
            type: DataTypes.JSON,
            allowNull: true,
        },
        tags: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        }, 

    }, {
        tableName: 'Machines',
        timestamps: false,
    });
    
    return Machine;

} */

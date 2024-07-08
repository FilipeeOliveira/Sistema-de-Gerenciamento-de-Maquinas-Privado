const { DataTypes } = require('sequelize')

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

}
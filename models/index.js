const dbConfig = require('../config/config.json');
const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false
});

const db = {};

const UserModel = require('./User');

db['User'] = UserModel(sequelize, Sequelize.DataTypes);

Object.values(db).forEach(model => {
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

var Sequelize = require('sequelize');
var Crypto = require('crypto');
var Bcrypt = require('bcrypt-nodejs');

var config = require('../../config/config.js');

// mysql login data from config
console.log(config);

var connection = new Sequelize(
    config.dbmysql.db_name,
    config.dbmysql.user,
    config.dbmysql.password, {
        host: config.dbmysql.host,
        dialect: 'mysql',
        operatorsAliases: Sequelize.Op,
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },
    });

var User = connection.define('userTable', {
    name: Sequelize.STRING,
    username: { type: Sequelize.STRING, unique: true },
    email: { type: Sequelize.STRING, unique: true },
    password: Sequelize.STRING,
    passwordResetToken: Sequelize.STRING,
    passwordResetExpires: Sequelize.DATE,
    gender: Sequelize.STRING,
    location: Sequelize.TEXT,
    website: Sequelize.STRING,
    picture: Sequelize.STRING,
    facebook: Sequelize.STRING,
    twitter: Sequelize.STRING,
    google: Sequelize.STRING,
    github: Sequelize.STRING,
    vk: Sequelize.STRING
});

connection.sync((err) => {
    if (err) throw err
    console.log('You are now connected to mysql database... ' + config.dbmysql.db_name);
})

module.exports = connection;
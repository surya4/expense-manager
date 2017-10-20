var mysql = require('mysql');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');

var config = require('../../config/config.js');

var connection = mysql.createConnection({
    host: config.dbmysql.host,
    user: config.dbmysql.user,
    password: config.dbmysql.password,
    database: config.dbmysql.db_name
});

connection.connect((err) => {
    if (err) throw err
    console.log('You are now connected to mysql database... ' + config.dbmysql.db_name);
})

connection.query('use ' + config.dbmysql.db_name);

module.exports = connection;
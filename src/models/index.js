var Sequelize = require('sequelize');
var fs = require("fs");
var path = require('path');
var config = require(path.join(__dirname, '../../config/config.js'));

// var UserMeta = require('./schema.js');
var db = {};
// mysql login data from config
console.log("Calling config -- > " + config);

var sequelize = new Sequelize(
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

// var UserSchema = sequelize.import(__dirname + "/schema.js");

// sequelize.sync(
//     //     { force: true }).then(function() {
//     //     // Table created
//     //     return User.create();
//     // }
// );

// // you can define relationships here
// module.exports.User = UserSchema;

// load models
// var models = [
//     'schema',
// ];

// models.forEach(function(model) {
//     module.exports[model] = sequelize.import(path.join(__dirname + '/' + model));
// });

// models.forEach(function(file) {
//     var model = sequelize.import(path.join(__dirname + '/' + file));
//     db[model.name] = model;
// });

// export connection
// module.exports.schema = models['schema'];
// module.exports.sequelize = sequelize;

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        var model = sequelize.import(path.join(__dirname, file));
        console.log("Calling imported models -- > " + model)
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log("Calling exporting db --> " + db);

module.exports = db;
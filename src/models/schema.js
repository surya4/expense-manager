var Sequelize = require('sequelize');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
// var connection = require('./index');
// var config = require('../../config/config.js');

// mysql login data from config
// console.log(config);

// var connection = new Sequelize(
//     config.dbmysql.db_name,
//     config.dbmysql.user,
//     config.dbmysql.password, {
//         host: config.dbmysql.host,
//         dialect: 'mysql',
//         operatorsAliases: Sequelize.Op,
//         pool: {
//             max: 5,
//             min: 0,
//             idle: 10000
//         },
//     });

// connection.sync((err) => {
//     if (err) throw err
//     console.log('You are now connected to mysql database... ' + config.dbmysql.db_name);
// });

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('userTables', {
        name: DataTypes.STRING,
        username: { type: DataTypes.STRING, unique: true },
        email: { type: DataTypes.STRING, unique: true, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        passwordResetToken: DataTypes.STRING,
        passwordResetExpires: DataTypes.DATE,
        gender: DataTypes.STRING,
        location: DataTypes.TEXT,
        website: DataTypes.STRING,
        picture: DataTypes.STRING,
        facebook: DataTypes.STRING,
        twitter: DataTypes.STRING,
        google: DataTypes.STRING,
        github: DataTypes.STRING,
        vk: DataTypes.STRING
    }, {
        // getterMethods: {
        //     password() {
        //         return undefined;
        //     }
        // },
        // setterMethods: {

        // },

        instanceMethods: {
            hashPassword: function(password, done) {
                return bcrypt.genSalt(10, function(err, salt) {
                    return bcrypt.hash(password, salt, function(error, encrypted) {
                        this.password = encrypted;
                        this.salt = salt;
                        return done();
                    });
                });
            },
            comparePassword: function(password, cb) {
                bcrypt.compare(password, this.password, function(err, isMatch) {
                    cb(err, isMatch);
                });
            },
            validatePassword: function(val) {
                if (val.length < 6) {
                    throw new Error("Please choose a longer password")
                }
            }
        },

        hidden: ['password', 'passwordResetToken', 'passwordResetExpires'],

        virtuals: {
            gravatar: function() {
                if (!this.get('email')) {
                    return 'https://gravatar.com/avatar/?s=200&d=retro';
                }
                var md5 = crypto.createHash('md5').update(this.get('email')).digest('hex');
                return 'https://gravatar.com/avatar/' + md5 + '?s=200&d=retro';
            }
        }
    });
    // console.log("Calling model2 --> " + UserSchema);
    return User;
};

// UserSchema.sync({ force: true }).then(function() {
//     // Table created
// return User;
// });

// module.exports = UserSchema;
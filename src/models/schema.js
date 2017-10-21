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

var User = connection.define('userTables', {
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
}, {

    initialize: function() {
        this.on('saving', this.hashPassword, this);
    },

    hashPassword: function(model, attrs, options) {
        var password = options.patch ? attrs.password : model.get('password');
        if (!password) { return; }
        return new Promise(function(resolve, reject) {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password, salt, null, function(err, hash) {
                    if (options.patch) {
                        attrs.password = hash;
                    }
                    model.set('password', hash);
                    resolve();
                });
            });
        });
    },

    comparePassword: function(password, done) {
        var model = this;
        bcrypt.compare(password, model.get('password'), function(err, isMatch) {
            done(err, isMatch);
        });
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

connection.sync((err) => {
    if (err) throw err
    console.log('You are now connected to mysql database... ' + config.dbmysql.db_name);
})

module.exports = User;
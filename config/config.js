var config = {
    dbmysql: {
        host: '',
        user: '',
        password: '',
        db_name: ''
    },
    dbmmongo: {
        database: 'mongodb://127.0.0.1:27017/dbname',
        port: '3000'
    },
    //server details
    default: {
        host: '127.0.0.1',
        port: '3000'
    }

}

module.exports = config;
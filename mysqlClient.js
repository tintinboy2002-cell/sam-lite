var mysql = require('mysql2');
var bluebird = require('bluebird');

function obj() {
    this.getMySqlConnectionPool = function() {
        var connection = mysql.createPool({
            host: process.env.HOST,
            user: process.env.DB_USER,
            database: process.env.DATABASE,
            password: process.env.DB_PASSWORD,
            connectTimeout: 10000
        });
        return connection;
    };
    this.getMySqlCustomConnectionPool = function(obj) {
        var connection = mysql.createPool(obj);
        return connection;
    };
}
module.exports = new obj();
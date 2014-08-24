
'use strict';

var mysql  = require('mysql');
var when   = require('when');
var Class  = require('cakes').Class;

var _      = require('../utils');
var Db     = require('../db');
var errors = require('../errors');

/**
 * Mysql driver.
 * @type {Function}
 */
var Mysql = Class(function() {

    /**
     * Max reconnect times.
     * @type {Number}
     */
    var MAX_RECONNECT_TIMES = 3;

    return {

        __construct: function(config) {
            this.reconnectTimes = 0;

            config = config || {};
            this.config = {
                host:     config.host     || '127.0.0.1',
                port:     config.port     || 3306,
                database: config.database || 'test',
                user    : config.username || 'root',
                password: config.password || '',
                charset : config.charset  || 'utf8'
            };
        },

        connect: function() {
            if (this.instance) {
                return this.deferred.promise;
            }

            if (this.deferred) {
                this.deferred.reject(new errors.DbError('Connection had been close.'));
                this.deferred = null;
            }
            this.deferred = when.defer();

            var self = this;
            var conncetion = mysql.createConnection(this.config);

            this.instance = conncetion;

            // connect to mysql
            conncetion.connect(function(err) {
                if (err) {
                    self.close();
                    self.deferred.reject(err);
                }

                // connect success
                self.deferred.resolve();
            });

            conncetion.on('end', function() {
                self.close();
            });

            conncetion.on('error', function(err) {
                self.close();
            });

            return this.deferred.promise;
        },

        query: function(sql) {
            var self = this;

            return this.connect().then(function() {
                var deferred = when.defer();

                self.instance.query(sql, function(err, result) {
                    if (err) {
                        // when query a large amount of data, it may be cause connection timeout, so we should do reconnect to database
                        if (err.code === 'PROTOCOL_CONNECTION_LOST' && self.reconnectTimes < MAX_RECONNECT_TIMES) {
                            self.close();
                            return self.query(sql);
                        }

                        deferred.reject(err);
                    }

                    self.reconnectTimes = 0;

                    if (_.isArray(result)) {
                        self.numRows = result.length;
                    } else if (result) {
                        self.affectedRows = result.affectedRows || 0;
                        self.lastInsertId = result.insertId || 0;
                    }

                    deferred.resolve(result);
                });

                return deferred.promise;
            });
        },

        execute: function(sql) {
            return this.query(sql);
        },

        /**
         * Get tables info from database.
         * @param  {String} dbName Name of database
         * @return {Array}         Name of tables stored in array
         */
        getTables: function(dbName) {
            var sql = null;
            if (_.isString(dbName) && dbName !== '') {
                sql = 'SHOW TABLES FROM ' + dbName;
            } else {
                sql = 'SHOW TABLES ';
            }

            var key = 'Tables_in_';
            if (_.isEmpty(dbName) || !_.isString(dbName)) {
                dbName = this.config.database;
            }
            key += dbName.toLowerCase();

            return this.query(sql).then(function(tables) {
                var result = {};
                var values = [];
                tables.forEach(function(table) {
                    values.push(table[key]);
                });

                result[dbName] = values;
                return when.resolve(result);
            });
        },

        /**
         * Get fields info from table.
         * @param  {String} tableName Name of table
         * @return {Object}           Fields info of table
         */
        getFields: function(tableName) {
            if (!_.isString(tableName)) {
                tableName = '';
            }

            var sql = 'SHOW COLUMNS FROM ' + this.parseKey(tableName);

            return this.query(sql).then(function(fields) {
                var result = {};
                fields.forEach(function(field) {
                    result[field.Field] = {
                        name: field.Field,
                        type: field.Type,
                        notnull: field.Null.toUpperCase() === 'NO',
                        default: field.Default,
                        primary: field.Key.toUpperCase() === 'PRI',
                        autoinc: field.Extra.toLowerCase() === 'auto_increment'
                    }
                });

                return when.resolve(result);
            });
        },

        parseKey: function(key) {
            key = key.trim();
            if(!_.isNumber(key) && !(/[,\'\"\*\(\)`.\s]/g).test(key)) {
                key = '`' + key + '`';
            }

            return key;
        },

        close: function() {
            if (this.instance) {
                this.instance.destroy();
                this.instance = null;
            }
        }
    }
}, Db);

module.exports = Mysql;

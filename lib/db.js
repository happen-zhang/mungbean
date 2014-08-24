
'use strict';

var when    = require('when');
var Class   = require('cakes').Class;

var _       = require('./utils');
var errors  = require('./errors');

/**
 * Db class.
 * @type {Function}
 */
var Db = Class(function() {

    var _instances = {};

    return {

        getInstance: function(config) {
            var identifier = _.serialize(config);

            if (!_instances[identifier]) {
                _instances[identifier] = this.factory(config);
            }

            return _instances[identifier];
        },

        factory: function(config) {
            config = this.parseConfig(config);

            var drivers = require('./drivers');
            var dbms = config.dbms.toLowerCase();
            if (_.isEmpty(dbms) || !drivers.hasOwnProperty(dbms)) {
                throw new errors.DbError('No such database type');
            }

            return new drivers[dbms](config);
        },

        /**
         * Insert data into database.
         * @param  {Object}  data    Data
         * @param  {Object}  options Insert options, such as tables
         * @param  {Boolean} replace Use replace or insert
         * @return {Promise}
         */
        insert: function(data, options, replace) {
            if (!_.isObject(data)) {
                data = {};
            }

            var self = this;
            var values = [];
            var fields = [];
            _.forOwn(data, function(value, key) {
                if (_.isScalar(value) || _.isNull(value)) {
                    fields.push(self.parseKey(key));
                    values.push(self.parseValue(value));
                }
            });

            var sql = (replace ? 'REPLACE' : 'INSERT') + ' INTO ' + this.parseTable(options.table) +
                      ' (' + fields.join(',') + ') VALUES (' + values.join(',') + ')';

            return this.execute(sql).then(function(result) {
                return when.resolve({
                    affectedRows: self.affectedRows
                });
            });
        },

        /**
         * Replace record into database.
         * @param  {Object}  data    Data
         * @param  {Object}  options Replace options, such as tables
         * @return {Promise}
         */
        replace: function(data, options) {
            return this.insert(data, options, true);
        },

        parseKey: function(key) {
            return key;
        },

        parseValue: function(value) {
            if (_.isString(value)) {
                value = "'" + this.escapeString(value) + "'";
            } else if (_.isBoolean(value)) {
                value = value ? 1 : 0;
            } else if (_.isNull(value)) {
                value = 'null';
            }

            return value;
        },

        parseTable: function(tables) {
            var self = this;
            if (_.isString(tables)) {
                tables = tables.split(',');
                tables = tables.map(function(table) {
                    return self.parseKey(table);
                });
                tables = tables.join(',');
            }

            return tables;
        },

        parseConfig: function(config) {
            if (_.isString(config) && config !== '') {
                config = this.parseDSN(config);
            }

            config = config || {};
            // to lower case of keys
            config = _.mapKeys(config, function(key) {
                return key.toLowerCase();
            });

            return {
                dbms:     config.dbtype   || '',
                host:     config.host     || '127.0.0.1',
                port:     config.port     || 3306,
                database: config.database || 'test',
                username: config.username || 'root',
                password: config.password || '',
                charset:  config.charset  || 'utf8'
            }
        },

        /**
         * DSN parser, it can parse the format like follow:
         * eg: mysql://username:passwd@localhost:3306/DbName#charset
         * @param  {String} dsn DSN string
         * @return {Object}     Config object
         */
        parseDSN: function(dsn) {
            if (!_.isString(dsn)) {
                return null;
            }

            var matches = (/^(.*?)\:\/\/(.*?)\:(.*?)\@(.*?)\:([0-9]{1,6})\/(.*?)#(.*?)$/g).exec(dsn.trim());

            if (!matches) {
                return null;
            }

            return {
                dbtype:     matches[1],
                host:       matches[4],
                port:       matches[5],
                database:   matches[6],
                username:   matches[2],
                password:   matches[3],
                charset:    matches[7]
            };
        },

        escapeString: function(str) {
            return _.addslashes(str);
        }
    };

});

module.exports = Db;

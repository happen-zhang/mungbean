
'use strict';

var Class   = require('cakes').Class;

var drivers = require('./drivers');
var errors  = require('./errors');
var _       = require('./utils');

/**
 * Db class.
 * @type {Function}
 */
var Db = Class(function(config) {

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

            var dbms = config.dbms.toLowerCase();
            if (_.isEmpty(dbms) || !drivers.hasOwnProperty(dbms)) {
                throw new errors.DbError('No such database type');
            }

            return new drivers[dbms];
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
        }
    };

});

module.exports = Db;

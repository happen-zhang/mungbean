
var mysql  = require('mysql');
var when   = require('when');
var Class  = require('cakes').Class;

var _      = require('../utils');
var errors = require('../errors');

/**
 * Mysql driver.
 * @type {Function}
 */
var Mysql = Class(function() {

    /**
     * instances of mysql conncetion
     * @type {Object}
     */
    var _instances = {};
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
            if (!_.isset(this.identifier)) {
                this.identifier = _.serialize(this.config);
            }

            if (_instances[this.identifier]) {
                this.instance = _instances[this.identifier];

                if (!this.instance) {
                    delete this.identifier;
                    return this.connect();
                }

                return this.deferred.promise;
            }

            if (this.deferred) {
                this.deferred.reject(new errors.MysqlError('Connection had been close.'));
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
                    deferred.resolve(result);
                });

                return deferred.promise;
            });
        },

        close: function() {
            function free(instance) {
                instance.destroy();
            }

            if (this.instance) {
                free(this.instance);
                this.instance = null;
            } else if (_instances[this.identifier]) {
                free(_instances[this.identifier]);
                _instances[this.identifier] = null;
                delete this.identifier;
            } else {
                var identifier = _.serialize(this.config);
                if (_instances[identifier]) {
                    free(_instances[identifier]);
                    _instances[identifier] = null;
                }
            }
        }
    }
});

module.exports = Mysql;

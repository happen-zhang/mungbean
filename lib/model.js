
'use strict';

var when  = require('when');
var Class = require('cakes').Class;

var Db    = require('./db');
var _     = require('./utils');
var errors = require('./errors');

/**
 * Model constructor.
 * @return {Functin} Constructor
 */
var Model = Class(function() {

    /**
     * Db instance
     * @type {Object}
     */
    var _dbInstances = {};

    return {

        /**
         * Model name
         * @type {String}
         */
        name: '',

        /**
         * Database name
         * @type {String}
         */
        dbName: '',

        /**
         * Table name
         * @type {String}
         */
        tableName: '',

        /**
         * Table prefix
         * @type {String}
         */
        tablePrefix: '',

        /**
         * Data of model
         * @type {Object}
         */
        data: {},

        __construct: function(name, tablePrefix, config) {
            // initialize hook
            this._initialize();

            if (_.isString(name) && name !== '') {
                if (name.indexOf('.') !== -1) {
                    var parts = name.split('.');
                    this.dbName = parts[0];
                    this.name = parts[1];
                } else {
                    this.name = name;
                }
            }

            config = config || {};
            config = _.mapKeys(config, function(key) {
                return key.toLowerCase();
            });
            if (_.isEmpty(tablePrefix) || !_.isString(tablePrefix)) {
                this.tablePrefix = '';
            } else if (_.isString(config.prefix)) {
                this.tablePrefix = config.prefix;
            }else {
                this.tablePrefix = tablePrefix;
            }

            this.initDb(config || {});
        },

        _initialize: function() {
            // hook
        },

        initDb: function(config) {
            if (!this.instance) {
                var identifier = _.serialize(config);
                if (!_dbInstances[identifier]) {
                    _dbInstances[identifier] = (new Db()).getInstance(config);
                }

                this.instance = _dbInstances[identifier];
            }

            return this.instance;
        },

        /**
         * Add a record.
         * @param  {Object}  data    Data of record
         * @param  {Object}  options Options
         * @param  {Boolean} replace Insert or replace
         * @return {Promise}
         */
        add: function(data, options, replace) {
            var deferred = when.defer();

            if (!_.isObject(data) || _.isEmpty(data)) {
                if (!_.isEmpty(this.data)) {
                    data = this.data;
                    this.data = {};
                } else {
                    deferred.reject(new errors.DbError('Invalid data.'));
                }
            }

            options = this.parseOptions(options);

            return this.instance.insert(data, options, replace).then(function(result) {
                data.id = result.lastInsertId || 0;

                return data;
            });
        },

        parseOptions: function(options) {
            options = options || {};
            var fields = null;

            if (_.isObject(options)) {
                // merge options
                options = _.assign(options, this.options);
            }

            if (!options.table) {
                options.table = this.getTableName();
            }

            options.model = this.name;
            this.options = {};

            return options;
        },

        /**
         * Return table name.
         * @return {String} Table name
         */
        getTableName: function() {
            if (_.isEmpty(this.tableName)) {
                this.tableName = !_.isEmpty(this.tablePrefix) ? this.tablePrefix : '';
                this.tableName += _.convertVarName(this.name);
                this.tableName = this.tableName.toLowerCase();
            }

            return !_.isEmpty(this.dbName) ? this.dbName + '.' + this.tableName : this.tableName;
        }
    }
});

module.exports = Model;

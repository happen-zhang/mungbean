
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
         * Table fields
         * @type {Object}
         */
        fields: {},

        /**
         * Primary key
         * @type {String}
         */
        pk: '',

        /**
         * Data of model
         * @type {Object}
         */
        data: {},

        /**
         * Db config
         * @type {Object}
         */
        config: null,

        /**
         * Auto increament
         * @type {Boolean}
         */
        isAutoInc: false,

        /**
         * Auto check table fields
         * @type {Boolean}
         */
        isAutoCheckFields: true,

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
            this.config = _.mapKeys(config, function(key) {
                return key.toLowerCase();
            });

            if (_.isEmpty(tablePrefix)) {
                this.tablePrefix = '';
            } else if (_.isString(tablePrefix)) {
                this.tablePrefix = tablePrefix;
            } else if (_.isString(this.config.prefix)) {
                this.tablePrefix = this.config.prefix;
            } else {
                this.tablePrefix = '';
            }
        },

        _initialize: function() {
            // hook
        },

        /**
         * Initialize db instance.
         * @return {Promise}
         */
        initDb: function() {
            var identifier = _.serialize(this.config);
            if (!this.instance) {
                if (!_dbInstances[identifier]) {
                    _dbInstances[identifier] = (new Db()).getInstance(this.config);
                }
            }

            // set this instance
            this.instance = _dbInstances[identifier];

            // hook
            this._afterDb();

            if (!_.isEmpty(this.name) && this.isAutoCheckFields) {
                return this.initFieldsInfo();
            }

            return when.promise;
        },

        /**
         * Initialize table fields info.
         * @return {Promise}
         */
        initFieldsInfo: function() {
            var self = this;

            return this.instance.getFields(this.getTableName()).then(function(fields) {
                var _name = [];
                var _type = {};
                _.forOwn(fields, function(attr, field) {
                    _name.push(field);

                    _type[field] = attr.type;
                    if (attr.primary) {
                        self.pk = field;

                        if (attr.autoinc) {
                            self.isAutoinc = true;
                        }
                    }
                });

                self.fields._name = _name;
                self.fields._type = _type;
                self.fields._pk = self.pk;

                return self.field;
            });
        },

        /**
         * Add a record.
         * @param  {Object}  data    Data of record
         * @param  {Object}  options Options
         * @param  {Boolean} replace Insert or replace
         * @return {Promise}
         */
        add: function(data, options, replace) {
            var self = this;

            return this.initDb().then(function() {
                var deferred = when.defer();

                if (!_.isObject(data) || _.isEmpty(data)) {
                    if (!_.isEmpty(self.data)) {
                        data = self.data;
                        self.data = {};
                    } else {
                        deferred.reject(new errors.DbError('Invalid data.'));
                    }
                }

                options = self.parseOptions(options);
                data = self.facade(data);

                return self.instance.insert(data, options, replace).then(function(result) {
                    data[self.getPk()] = result.lastInsertId || 0;

                    return data;
                });
            });
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
        },

        /**
         * Return table primary key.
         * @return {String} Primary key
         */
        getPk: function() {
            return this.pk;
        },

        /**
         * Retrun value.
         * @param  {String} key   Key
         * @param  {MIX}    value Value
         */
        setData: function(key, value) {
            if (!_.isObject(this.data)) {
                this.data = {};
            }

            this.data[key] = value;

            return this;
        },

        /**
         * Set model data.
         * @param  {String} key   Key name
         * @return {MIX}         Value
         */
        getData: function(key) {
            return this.data[key];
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
         * Filter data.
         * @param  {Object} data Data
         * @return {Object}
         */
        facade: function(data) {
            var fields = null;

            if (!_.isObject(data)) {
                data = {};
            }

            if (!_.isEmpty(this.options.field)) {
                fields = this.options.field;
                delete this.options.field;

                if (_.isString(fields)) {
                    fields = fields.split(',');
                }
            } else if (!_.isEmpty(this.fields)) {
                fields = this.fields._name;
            }

            var self = this;
            if (!_.isNull(fields)) {
                _.forOwn(data, function(value, key) {
                    if (!_.inArray(key, fields)) {
                        delete data[key];
                    } else if (_.isScalar(value)) {
                        data[key] = self.parseType(value, key);
                    }
                });
            }

            return data;
        },

        /**
         * Convert type of data field.
         * @param  {MIX}    value Value
         * @param  {String} key   Field name
         * @return {MIX}          Value
         */
        parseType: function(value, key) {
            if (this.fields._type && _.isEmpty(this.fields._type[key])) {
                return value;
            }

            var fieldType = this.fields._type[key].toLowerCase();
            if (fieldType.indexOf('bigint') === -1 && fieldType.indexOf('int') !== -1) {
                value = parseInt(value);
            } else if (fieldType.indexOf('float') !== -1 || fieldType.indexOf('double') !== -1) {
                value = parseFloat(value);
            } else if (fieldType.indexOf('bool') !== -1) {
                value = Boolean(value);
            }

            return value;
        },

        _afterDb: function() {
        },
    }
});

module.exports = Model;

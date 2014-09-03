
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
         * Options
         * @type {Object}
         */
        options: {},

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
         * Select.
         * @param  {Object} options Options
         * @return Promise
         */
        select: function(options) {
            var self = this;

            return this.initDb().then(function() {
                var where = {};
                if (_.isString(options) || _.isNumber(options)) {
                    var pk = self.getPk();
                    if (_.isString(options) && options.indexOf(',') !== -1) {
                        where[pk] = { IN: options };
                    } else {
                        where[pk] = options;
                    }

                    options = {};
                    options.where = where;
                }

                if (options === false) {
                    // return sql string, but not execute sql
                    options = self.parseOptions({});
                    return when.resolve('(' + self.instance.buildSelectSql(options) + ')');
                }

                options = self.parseOptions(options);
                return self.instance.select(options).then(function(rows) {
                    // index
                    if (_.isString(options.index)) {
                        var index = options.index.split(',');
                        var key = null;
                        var result = {};

                        index = index.map(function(i) {
                            return i.trim();
                        });
                        rows.forEach(function(row) {
                            key = row[index[0]];
                            if (!_.isEmpty(key)) {
                                if (_.isset(row[index[1]])) {
                                    result[key] = row[index[1]];
                                } else {
                                    result[key] = row;
                                }
                            }
                        });

                        rows = result;
                    }

                    return rows;
                });
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

            if (!_.isObject(data) || _.isEmpty(data)) {
                if (!_.isEmpty(self.data)) {
                    data = self.data;
                    self.data = {};
                } else {
                    when.reject(new errors.DbError('[add]: Invalid data.'));
                }
            }

            return this.initDb().then(function() {
                options = self.parseOptions(options);
                data = self.facade(data);
                if (_.isEmpty(data)) {
                    when.reject(new errors.DbError('[add]: Invalid data.'));
                }

                return self.instance.insert(data, options, replace).then(function(result) {
                    data[self.getPk()] = result.lastInsertId || 0;

                    return data;
                });
            });
        },

        /**
         * All a batch of records.
         * @param {Array}    data    Data array
         * @param {Object}   options Options
         * @param {Booleans} replace Insert or replace
         */
        addAll: function(data, options, replace) {
            var self = this;

            if (!_.isArray(data) || _.isEmpty(data)) {
                when.reject(new errors.DbError('[addAll]: Invalid data.'));
            }

            return this.initDb().then(function() {
                options = self.parseOptions(options);
                data.forEach(function(item, index) {
                    data[index] = self.facade(item);
                    if (_.isEmpty(data[index])) {
                        data[index] = null;
                    }
                });

                return self.instance.insertAll(data, options, replace);
            });
        },

        /**
         * Select add.
         * @param  {MIX}     fields  Fields
         * @param  {String}  table   Table name
         * @param  {Object}  options Options
         * @return {Promise}
         */
        selectAdd: function(fields, table, options) {
            if (_.isEmpty(fields) || (!_.isString(fields) && !_.isArray(fields))) {
                fields = options.fields;
            }

            if (_.isString(fields)) {
                fields = fields.split(',');
            }

            if (_.isEmpty(table) || !_.isString(table)) {
                table = this.getTableName();
            }

            var self = this;
            options = this.parseOptions(options);

            return this.initDb().then(function() {
                return self.instance.selectInsert(fields, table, options);
            });
        },

        /**
         * Save.
         * @param  {Object}  data    Data
         * @param  {Object}  options Options
         * @return {Promise}
         */
        save: function(data, options) {
            var self = this;

            if (!_.isObject(data) || _.isEmpty(data)) {
                if (!_.isEmpty(self.data)) {
                    data = self.data;
                    self.data = {};
                } else {
                    when.reject(new errors.DbError('[save]: Invalid data.'));
                }
            }

            return this.initDb().then(function() {
                options = self.parseOptions(options);
                data = self.facade(data);
                if (_.isEmpty(data)) {
                    when.reject(new errors.DbError('[save]: Invalid data.'));
                }

                var pk = self.getPk();
                var where = {};
                if (!_.isset(options.where)) {
                    if (_.isset(data[pk])) {
                        where[pk] = data[pk];
                        options.where = where;
                    } else {
                        when.reject(new errors.DbError('[save]: No update conditions.'));
                    }
                }

                return self.instance.update(data, options);
            });
        },

        /**
         * Delete.
         * @param  {Object}  options Options
         * @return {Promise}
         */
        delete: function(options) {
            var self = this;

            return this.initDb().then(function() {
                var where = {};
                var pk = self.getPk();

                if (_.isNumber(options) || _.isString(options)) {
                    if (_.isString(options) && options.indexOf(',') !== -1) {
                        where[pk] = { IN: options };
                    } else {
                        where[pk] = options;
                    }

                    options = {};
                    options.where = where;
                } else if (_.isEmpty(options) && _.isEmpty(self.options.where)) {
                    if (!_.isEmpty(self.data) && _.isset(self.data[pk])) {
                        return self.delete(self.data[pk]);
                    }
                }

                options = self.parseOptions(options);
                if (_.isEmpty(options.where)) {
                    when.reject('[delete]: No where arguments.');
                }

                return self.instance.delete(options);
            });
        },

        /**
         * Where conditions.
         * @param  {MIX}    where Query conditions
         * @return {Object}       This
         */
        where: function(where) {
            if (_.isString(where) && !_.isEmpty(where)) {
                var map = {};
                map._string = where;
                where = map;
            }

            if (_.isObject(this.options.where)) {
                this.options.where = _.assign(this.options.where, where);
            } else {
                this.options.where = where;
            }

            return this;
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
         * Return last query or execute sql.
         * @return {String} Sql string.
         */
        getLastSql: function() {
            return this.instance.getLastSql();
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
                value = parseInt(value, 10);
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

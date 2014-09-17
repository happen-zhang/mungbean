
'use strict';

var util  = require('util');

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

    /**
     * Fields cache
     * @type {Object}
     */
    var _tableFields = {};

    /**
     * Insert status
     * @type {Number}
     */
    var MODEL_INSERT = 1;

    /**
     * Update status
     * @type {Number}
     */
    var MODEL_UPDATE = 2;

    /**
     * Both insert and update
     * @type {Number}
     */
    var MODEL_BOTH   = 3;

    /**
     * Must be validate
     * @type {Number}
     */
    var MUST_VALIDATE = 1;

    /**
     * If field exists then validate
     * @type {Number}
     */
    var EXIST_VALIDATE = 0;

    /**
     * If value not be empty then validate
     * @type {Number}
     */
    var VALUE_VALIDATE = 2;

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
         * Validation rules
         * @type {Array}
         */
        _validate: [],

        /**
         * Errors
         * @type {[MIX]}
         */
        error: null,

        /**
         * Patch validate
         * @type {Boolean}
         */
        isPatchValidate: false,

        /**
         * All fields
         * @type {Boolean}
         */
        isAllFields: false,

        /**
         * Except fields
         * @type {Array}
         */
        exceptFields: [],

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

            // initialize db instance
            this.initDb();
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
        },

        /**
         * Get model fields info from table.
         * @return {Promise}
         */
        getFieldsInfo: function() {
            var tableName = this.getTableName();
            if (!_.isEmpty(_tableFields[tableName])) {
                this.fields = _tableFields[tableName];
                return when.resolve(this.fields);
            }

            var self = this;
            return this.instance.getFields(tableName).then(function(fields) {
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
                _tableFields[tableName] = self.fields;

                return self.fields;
            });
        },

        /**
         * Select.
         * @param  {Object} options Options
         * @return Promise
         */
        select: function(options) {
            var self = this;

            return this.getPk().then(function(pk) {
                var where = {};
                if (_.isString(options) || _.isNumber(options)) {
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
                    return when.resolve(self.getBuildSql({}));
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
         * Find one record.
         * @param  {Object}  options Options
         * @return {Promise}
         */
        find: function(options) {
            var self = this;
            options = options || {};

            return this.getPk().then(function(pk) {
                var where = {};

                if (_.isNumber(options) || _.isString(options)) {
                    where[pk] = options;
                    options = {};
                    options.where = where;
                }

                options.limit = 1;
                options = self.parseOptions(options);

                return self.instance.select(options).then(function(result) {
                    return result[0] ? result[0] : null;
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

            return this.getPk().then(function(pk) {
                data = self.facade(data);
                options = self.parseOptions(options);

                if (_.isEmpty(data)) {
                    when.reject(new errors.DbError('[add]: Invalid data.'));
                }

                return self.instance.insert(data, options, replace).then(function(result) {
                    data[pk] = result.lastInsertId || 0;
                    return data;
                });
            });
        },

        /**
         * All a batch of records.
         * @param {Array}    data    Data array
         * @param {Object}   options Options
         * @param {Boolean} replace Insert or replace
         */
        addAll: function(data, options, replace) {
            if (!_.isArray(data) || _.isEmpty(data)) {
                when.reject(new errors.DbError('[addAll]: Invalid data.'));
            }

            var self = this;
            data.forEach(function(item, index) {
                data[index] = self.facade(item);
                if (_.isEmpty(data[index])) {
                    data[index] = null;
                }
            });
            options = this.parseOptions(options);

            return this.instance.insertAll(data, options, replace);
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

            options = this.parseOptions(options);
            return this.instance.selectInsert(fields, table, options);
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
                if (!_.isEmpty(this.data)) {
                    data = this.data;
                    this.data = {};
                } else {
                    when.reject(new errors.DbError('[save]: Invalid data.'));
                }
            }

            return this.getPk().then(function(pk) {
                data = self.facade(data);
                options = self.parseOptions(options);

                if (_.isEmpty(data)) {
                    when.reject(new errors.DbError('[save]: Invalid data.'));
                }

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
         * Save data with Specify field.
         * @param  {String}  field Field want to be update.
         * @param  {MIX}     value New value of field.
         * @return {Promise}
         */
        saveField: function(field, value) {
            var data = null;

            data = _.isArray(field) ? field : {};
            data[field] = value;

            return this.save(data);
        },

        /**
         * Save field value increment by step.
         * @param  {String}  field Field want to be update.
         * @param  {Number}  step  Step want to pre increment.
         * @return {Promise}
         */
        saveInc: function(field, step) {
            step = !step ? 1 : step;

            return this.saveField(field, { EXP: field + '+' + step });
        },

        /**
         * Save field value decrement by step.
         * @param  {String}  field Field want to be update.
         * @param  {Number}  step  Step want to pre decrement.
         * @return {Promise}
         */
        saveDec: function(field, step) {
            step = !step ? 1 : step;

            return this.saveField(field, { EXP: field + '-' + step });
        },

        /**
         * Delete.
         * @param  {Object}  options Options
         * @return {Promise}
         */
        delete: function(options) {
            var self = this;

            return this.getPk().then(function(pk) {
                var where = {};

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
         * Query sql string.
         * @param  {String}  sql   Sql string
         * @param  {MIX}     parse Parse options
         * @return {Promise}
         */
        query: function(sql, parse) {
            if (!_.isBoolean(parse) && !_.isArray(parse)) {
                parse = [].slice.call(arguments, 1);
            }

            sql = this.parseSql(sql, parse);
            return this.instance.query(sql);
        },

        /**
         * Execute sql string.
         * @param  {String}  sql   Sql string
         * @param  {MIX}     parse Parse options
         * @return {Promise}
         */
        execute: function(sql, parse) {
            if (!_.isBoolean(parse) && !_.isArray(parse)) {
                parse = [].slice.call(arguments, 1);
            }

            sql = this.parseSql(sql, parse);
            return this.instance.execute(sql);
        },

        /**
         * Create data.
         * @param  {Object} data Data
         * @param  {Number} type Model status
         * @return {Object}      New data
         */
        create: function(data, type) {
            if (_.isEmpty(data) || !_.isObject(data)) {
                return when.reject('[create]: Data must a not empty object.');
            }

            var self = this;
            return this.getPk().then(function(pk) {
                var fields = null;
                type = type ? type : (data[pk] ? MODEL_UPDATE : MODEL_INSERT);

                if (!_.isEmpty(self.options.field)) {
                    fields = self.options.field;
                    delete self.options.field;
                } else if (self.isAllFields === true && !_.isEmpty(self.fields)) {
                    fields = self.fields._name;
                    self.isAllFields = false;
                } else if (!_.isEmpty(self.exceptFields) && !_.isEmpty(self.fields)) {
                    fields = _.difference(self.fields._name, self.exceptFields);
                    self.exceptFields = [];
                }

                if (!_.isEmpty(fields)) {
                    if (_.isString(fields)) {
                        fields = fields.split(',');
                        fields = fields.map(function(field) {
                            return field.trim();
                        });
                    }

                    _.forOwn(data, function(val, key) {
                        if (!_.inArray(key, fields)) {
                            delete data[key];
                        }
                    });
                }

                // autoValidation
                if (!self.autoValidation(data, type)) {
                    return when.reject(self.error);
                };

                if (self.isAutoCheckFields && !_.isEmpty(self.fields._name)) {
                    _.forOwn(data, function(val, key) {
                        if (!_.inArray(key, self.fields._name)) {
                            delete data[key];
                        }
                    });
                }

                // autoOperation

                self.data = data;

                return when.resolve(data);
            });
        },

        /**
         * Distinct.
         * @param  {MIX}    distinct Whether distinct or not
         * @return {Object}          This
         */
        distinct: function(distinct) {
            this.options.distinct = distinct;

            return this;
        },

        /**
         * Lock.
         * @param  {MIX}    lock Whether execute lock
         * @return {Object}      This
         */
        lock: function(lock) {
            this.options.lock = lock;

            return this;
        },

        /**
         * Where conditions.
         * @param  {MIX}    where Query conditions
         * @return {Object}       This
         */
        where: function(where, bindValue) {
            var self = this;

            if (_.isset(bindValue) && _.isString(where)) {
                if (!_.isArray(bindValue)) {
                    bindValue = [].slice.call(arguments, 1);
                }

                bindValue = bindValue.map(function(value) {
                    return self.instance.parseValue(value);
                });

                bindValue.unshift(where);
                where = util.format.apply(this, bindValue);
            }

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
         * Specify fields to query.
         * @param  {MIX}    fields Table field
         * @return {Object}        This
         */
        field: function(fields, except) {
            if (fields === true) {
                this.isAllFields = true;
            } else if (except) {
                if (_.isString(fields)) {
                    fields = fields.split(',');
                }

                fields = _.isArray(fields) ? fields : [];
                this.exceptFields = fields.map(function(field) {
                    return field.trim();
                });
            } else {
                this.options.field = fields;
            }

            return this;
        },

        /**
         * Order.
         * @param  {MIX}    order Query order
         * @return {Object}       This
         */
        order: function(order) {
            this.options.order = order;

            return this;
        },

        /**
         * Limit.
         * @param  {MIX}    limit Query rows limit
         * @return {Object}       This
         */
        limit: function(limit, length) {
            if (!length && _.isString(limit) && limit.indexOf(',') !== -1) {
                var part = limit.split(',');
                limit = part[0];
                length = part[1];
            }

            this.options.limit = parseInt(limit, 10) + (length ? ',' + parseInt(length, 10) : '');

            return this;
        },

        /**
         * Page.
         * @param  {MIX}    page     Page number
         * @param  {Number} listRows Perpage list rows
         * @return {Object}          This
         */
        page: function(page, listRows) {
            if (!listRows && _.isString(page) && page.indexOf(',') !== -1) {
                var part = page.split(',');
                page = part[0];
                listRows = part[1];
            }

            this.options.page = [parseInt(page, 10), parseInt(listRows, 10)];
            return this;
        },

        /**
         * Join.
         * @param  {MIX}    join Join string
         * @param  {String} type Four type of join sql
         * @return {Object}      This
         */
        join: function(join, type) {
            if (!_.isString(type) || !_.inArray(type.toUpperCase(), ['INNER', 'RIGHT', 'LEFT', 'FULL'])) {
                type = 'INNER';
            } else {
                type = type.toUpperCase();
            }

            var self = this;
            var getJoinStr = function(join, type) {
                join = join.replace(/__([A-Z_-]+)__/ig, function(matches, i) {
                    return self.tablePrefix + i.toLowerCase();
                });

                return join.lastIndexOf('JOIN') === -1 ? type + ' JOIN ' + join : join;
            };
            this.options.join = _.isArray(this.options.join) ? this.options.join : [];

            if (_.isArray(join)) {
                join.forEach(function(item, index) {
                    join[index] = getJoinStr(item, type);
                });

                this.options.join = join;
            } else if (!_.isEmpty(join)) {
                this.options.join.push(getJoinStr(join, type));
            }

            return this;
        },

        /**
         * Switch table to operate databse.
         * @param  {MIX}    table Tables
         * @return {Object}       This
         */
        table: function(table) {
            if (_.isObject(table)) {
                this.options.table = table;
            } else if (_.isString(table) && table != '') {
                table = table.replace(/__([A-Z_-]+)__/ig, function(matches, name) {
                    return name.toLowerCase();
                });

                this.options.table = this.tablePrefix + table;
            }

            return this;
        },

        /**
         * Group.
         * @param  {String} group Group
         * @return {Object}       This
         */
        group: function(group) {
            this.options.group = group;

            return this;
        },

        /**
         * Having.
         * @param  {String} having Having
         * @return {Object}        This
         */
        having: function(having) {
            this.options.having = having;

            return this;
        },

        /**
         * Comment.
         * @param  {String} comment Comment
         * @return {Object}         This
         */
        comment: function(comment) {
            this.options.comment = comment;

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
         * Get table fields.
         * @return {Promise}
         */
        getTableFields: function() {
            if (!_.isEmpty(this.options.table)) {
                var tables = this.options.table.split(' ');

                return this.instance.getFields(tables[0]).then(function(fields) {
                    return _.keys(fields);
                });
            } else if (!_.isEmpty(this.fields._name)) {
                return when.resolve(this.fields._name);
            } else {
                return this.getFieldsInfo().then(function(fields) {
                    return fields._name;
                });
            }
        },

        /**
         * Return table primary key.
         * @return {Promise}
         */
        getPk: function() {
            return this.getFieldsInfo().then(function(fieldsInfo) {
                return fieldsInfo._pk;
            });
        },

        /**
         * Return last query or execute sql.
         * @return {String} Sql string.
         */
        getLastSql: function() {
            return this.instance.getLastSql();
        },

        /**
         * Get sql which can be used to sub query.
         * @param  {Object} options Options
         * @return {String}         Sql
         */
        getBuildSql: function(options) {
            options = this.parseOptions(options);
            return '(' + this.instance.buildSelectSql(options).trim() + ')';
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

        /**
         * Auto validate field.
         * @param  {Object}  data Data
         * @param  {Number}  type Type
         * @return {Boolean}      Result
         */
        autoValidation: function(data, type) {
            var validate = null;
            if (!_.isEmpty(this.options.validate)) {
                validate = this.options.validate;
                delete this.options.validate;
            } else if (!_.isEmpty(this._validate)) {
                validate = this._validate;
            }

            if (_.isObject(validate)) {
                if (this.isPatchValidate) {
                    this.error = {};
                }

                var self = this;
                // [field, rule, message, condition, type, when, params]
                _.forOwn(validate, function(item) {
                    if (!_.isset(item[5]) || item[5] == MODEL_BOTH || item[5] == type) {
                        item[3] = _.isset(item[3]) ? item[3] : EXIST_VALIDATE;
                        item[4] = _.isset(item[4]) ? item[4] : 'regex';

                        var result = false;
                        switch (item[3]) {
                            case MUST_VALIDATE:
                                result = !(false === self.validationField(data, item));
                                break ;

                            case VALUE_VALIDATE:
                                if (_.isString(data[item[0]]) && data[item[0]].trim() !== '') {
                                    result = !(false === self.validationField(data, item));
                                }
                                break ;

                            default:
                                if (_.isset(data[item[0]])) {
                                    result = !(false === self.validationField(data, item));
                                }
                        }

                        if (result === false) {
                            return false;
                        }
                    }
                });

                if (!_.isEmpty(this.error)) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Validate field.
         * @param  {Object} data Data
         * @param  {Array}  item Condition item
         * @return {MIX}         Result
         */
        validationField: function(data, item) {
            if (this.isPatchValidate && _.isset(this.error[item[0]])) {
                return ;
            }

            if (false === this.validationFieldItem(data, item)) {
                if (this.isPatchValidate) {
                    this.error[item[0]] = item[2];
                } else {
                    this.error = item[2];
                    return false;
                }
            }

            return ;
        },

        validationFieldItem: function(data, item) {
            switch (item[4].trim().toLowerCase()) {
                case 'function':
                case 'callback':
                    break ;

                case 'confirm':
                    break ;

                case 'unique':
                    break ;

                default:
                    return this.check(data[item[0]], item[1], item[4]);
            }
        },

        /**
         * Check value with rule.
         * @param  {String}  value Value
         * @param  {MIX}     rule  Rule
         * @param  {Number}  type  Type
         * @return {Boolean}       Result
         */
        check: function(value, rule, type) {
            var result = false;
            type = _.isString(type) ? type.toLowerCase() : 'regex';

            switch (type) {
                case 'in':
                case 'notin':
                    var range = rule;
                    if (!_.isArray(range)) {
                        if (_.isString(range)) {
                            range = range.split(',');
                            range = range.map(function(val) {
                                return val.trim();
                            });
                        } else {
                            range = [];
                        }
                    }

                    result = (type == 'in') ? (_.inArray(value, range)) : !(_.inArray(value, range));
                    break ;

                case 'between':
                case 'notbetween':
                    var min = null;
                    var max = null;
                    if (_.isArray(rule) && _.isset(rule[1])) {
                        min = rule[0];
                        max = rule[1];
                    } else if (_.isString(rule) && rule.indexOf(',') !== -1) {
                        var part = rule.split(',');
                        min = part[0].trim();
                        max = part[1].trim();
                    }

                    if (min !== null && max !== null) {
                        result = (type == 'between') ? (value >= min && value <= max) : (value < min || value > max);
                    }
                    break ;

                case 'equal':
                case 'notequal':
                    result = (type == 'equal') ? value == rule : value != rule;
                    break ;

                case 'length':
                    if (_.isString(value)) {
                        var length = value.length;
                        if (_.isString(rule) && rule.indexOf(',')) {
                            var part = rule.split(',');
                            result = length >= parseInt(part[0], 10) && length <= parseInt(part[1], 10);
                        } else {
                            result = length == parseInt(rule, 10);
                        }
                    }
                    break ;

                default:
                    result = this.regex(value, rule);
            }

            return result;
        },

        /**
         * Use regex to check value.
         * @param  {String}  value Value
         * @param  {String}  rule  Rule
         * @return {Boolean}       Result
         */
        regex: function(value, rule) {
            if (!_.isString(rule)) {
                return false;
            }

            var validate = {
                require: /\S+/,
                email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
                url: /^http(s?):\/\/(?:[A-za-z0-9-]+\.)+[A-za-z]{2,4}(:\d+)?(?:[\/\?#][\/=\?%\-&~`@[\]\':+!\.#\w]*)?$/,
                currency: /^\d+(\.\d+)?$/,
                number: /^\d+$/,
                zip: /^\d{6}$/,
                integer: /^[-\+]?\d+$/,
                double: /^[-\+]?\d+(\.\d+)?$/,
                english: /^[A-Za-z]+$/
            };

            rule = rule.toLowerCase();
            if (_.has(validate, rule) && validate[rule].test(value)) {
                return true;
            }

            return false;
        },

        /**
         * Parse sql string.
         * @param  {String} sql   Sql string
         * @param  {MIX}    parse Parse options
         * @return {String}       Sql
         */
        parseSql: function(sql, parse) {
            sql = !_.isString(sql) ? '' : sql;

            if (parse === true) {
                var options = this.parseOptions();
                sql = this.instance.parseSql(sql, options);
            } else if (_.isset(parse) && _.isArray(parse)) {
                var self = this;
                parse = parse.map(function(value) {
                    return self.instance.parseValue(value);
                });

                parse.unshift(sql);
                sql = util.format.apply(this, parse);
            } else {
                var prefix = this.tablePrefix;
                sql = sql.replace('__TABLE__', this.getTableName()).replace('__PREFIX__', prefix);
                sql = sql.replace(/__([A-Z_-]+)__/ig, function(matches, name) {
                    return prefix + name.toLowerCase();
                });
            }

            return sql;
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

            // except fields
            if (!_.isEmpty(this.exceptFields) && !_.isEmpty(this.fields)) {
                options.field = _.difference(this.fields._name, this.exceptFields);
                this.exceptFields = [];
            }

            // all fields
            if (this.isAllFields === true && !_.isEmpty(this.fields)) {
                options.field = this.fields._name;
                this.isAllFields = false;
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
            } else if (this.isAllFields === true && !_.isEmpty(this.fields)) {
                fields = this.fields._name;
                this.isAllFields = false;
            } else if (!_.isEmpty(this.exceptFields) && !_.isEmpty(this.fields)) {
                fields = _.difference(this.fields._name, this.exceptFields);
                this.exceptFields = [];
            } else if (!_.isEmpty(this.fields)) {
                fields = this.fields._name;
            }

            if (_.isString(fields)) {
                fields = fields.split(',');
                fields = fields.map(function(field) {
                    return field.trim();
                });
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

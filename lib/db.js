
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

    /**
     * Select sql
     * @type {String}
     */
    var SELECT_SQL = 'SELECT%DISTINCT% %FIELD% FROM %TABLE%%JOIN%%WHERE%%GROUP%%HAVING%%ORDER%%LIMIT% %COMMENT%';

    /**
     * Comparison
     * @type {Object}
     */
    var COMPARISON = {
        eq: '=',
        neq: '<>',
        gt: '>',
        egt: '>=',
        lt: '<',
        elt: '<=',
        notlike: 'NOT LIKE',
        like: 'LIKE',
        in: 'IN',
        notin: 'NOT IN',
        between: 'BETWEEN',
        notbetween: 'NOT BETWEEN'
    };

    /**
     * Default list rows
     * @type {Number}
     */
    var LIST_ROWS = 20;

    return {

        /**
         * Last query or execute sql
         * @type {String}
         */
        sqlString: '',

        /**
         * Last insert id
         * @type {Number}
         */
        lastInsertId: 0,

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
            if (!_.isObject(data) || _.isEmpty(data)) {
                return when.reject(new errors.DbError('Invalid data.'));
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

            options = options || {};
            var sql = (replace ? 'REPLACE' : 'INSERT') + ' INTO ' + this.parseTable(options.table) +
                      ' (' + fields.join(',') + ') VALUES (' + values.join(',') + ')';

            return this.execute(sql).then(function(result) {
                return when.resolve({
                    affectedRows: self.affectedRows,
                    lastInsertId: self.lastInsertId || 0
                });
            });
        },

        /**
         * Insert into select.
         * @param  {MIX}     fields  Fields of data
         * @param  {MIX}     table   Table
         * @param  {Object}  options Options
         * @return {Promise}
         */
        selectInsert: function(fields, table, options) {
            if (_.isEmpty(fields) || (!_.isString(fields) && !_.isArray(fields))) {
                return when.reject(new errors.DbError('Invalid data.'));
            }

            if (_.isString(fields)) {
                fields = fields.split(',');
            }

            var self = this;
            fields = fields.map(function(value) {
                return self.parseKey(value);
            });

            var sql = 'INSERT INTO ' + this.parseTable(table) + ' (' + fields.join(',') + ') ';

            sql += this.buildSelectSql(options);

            return this.execute(sql).then(function(result) {
                return when.resolve({
                    affectedRows: self.affectedRows,
                    lastInsertId: self.lastInsertId || 0
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

        /**
         * Update records.
         * @param  {Object}  data    Data
         * @param  {Object}  options Options
         * @return {Promise}
         */
        update: function(data, options) {
            if (!_.isObject(data) || _.isEmpty(data)) {
                return when.reject(new errors.DbError('Invalid data.'));
            }

            options = options || {};
            var sql = 'UPDATE ' + this.parseTable(options.table) +
                                  this.parseSet(data) +
                                  this.parseWhere(options.where || '') +
                                  this.parseOrder(options.order || '') +
                                  this.parseLimit(options.limit || '') +
                                  this.parseComment(options.comment || '');

            var self = this;
            return this.execute(sql).then(function(results) {
                return when.resolve({
                    affectedRows: self.affectedRows
                });
            });
        },

        /**
         * Delete records from database.
         * @param  {Object}  options Options
         * @return {Promise}
         */
        delete: function(options) {
            if (_.isEmpty(options) || !_.isObject(options)) {
                return when.reject(new errors.DbError('Invalid options.'));
            }

            var sql = 'DELETE FROM ' + this.parseTable(options.table) +
                                       this.parseWhere(options.where || '') +
                                       this.parseOrder(options.order || '') +
                                       this.parseLimit(options.limit || '') +
                                       this.parseComment(options.comment || '');
            var self = this;
            return this.execute(sql).then(function(result) {
                return when.resolve({
                    affectedRows: self.affectedRows
                });
            });
        },

        /**
         * Select records from database.
         * @param  {Object} options Options to bulid sql
         * @return {Promise}
         */
        select: function(options) {
            options = options || {};

            var sql = this.buildSelectSql(options);
            return this.query(sql);
        },

        /**
         * Return last query or execute sql.
         * @return {String} Sql string.
         */
        getLastSql: function() {
            return this.sqlString;
        },

        /**
         * Return last insert id.
         * @return {String} Last insert id
         */
        getLastInsertId: function() {
            return this.lastInsertId;
        },

        buildSelectSql: function(options) {
            options = options || {};

            if (options.page) {
                var page = 0;
                var listRows = 0;
                var limit = _.isNumber(options.limit) ? options.limit : LIST_ROWS;
                if (_.isArray(options.page)) {
                    page = options.page[0];
                    listRows = options.page[1];
                } else if (_.isString(options.page)) {
                    var parts = options.page.split(',');
                    page = parts[0];
                    listRows = parts[1];
                }

                page = page > 0 ? page : 1;
                listRows = listRows > 0 ? listRows : limit;
                var offset = listRows * (page - 1);
                options.limit = offset + ',' + listRows;
            }

            // Todo: wirte into file cache

            var sql = this.parseSql(SELECT_SQL, options);
            sql += this.parseLock(!!options.lock);

            // Todo: wirte into file cache

            return sql;
        },

        parseSql: function(sql, options) {
            options = options || {};

            var self = this;
            var methodName = '';
            sql = sql.replace(/\%([A-Z]+)\%/g, function(matches, key) {
                key = key.toLowerCase();
                methodName = key.charAt(0).toUpperCase() + key.substr(1);
                return self['parse' + methodName](options[key]);
            });

            return sql;
        },

        parseSet: function(data) {
            var set = [];
            var self = this;
            _.forOwn(data, function(value, key) {
                if (_.isScalar(value) || _.isNull(value)) {
                    set.push(self.parseKey(key) + '=' + self.parseValue(value));
                }
            });

            return ' SET ' + set.join(',');
        },

        parseDistinct: function(distinct) {
            return !_.isEmpty(distinct) ? ' DISTINCT ' : '';
        },

        parseField: function(fields) {
            if (_.isString(fields) && fields != '') {
                fields = fields.split(',');
            }

            var self = this;
            var allFieds = [];
            if (_.isArray(fields)) {
                fields.forEach(function(field) {
                    allFieds.push(self.parseKey(field));
                });
            } else if (_.isObject(fields)) {
                _.forOwn(fields, function(value, key) {
                    allFieds.push(self.parseKey(key) + ' AS ' + self.parseKey(value));
                });
            }

            var fieldsStr = null;
            if (allFieds.length) {
                fieldsStr = allFieds.join(',');
            } else {
                fieldsStr = '*';
            }

            return fieldsStr;
        },

        parseWhere: function(where) {
            var whereStr = '';
            if (_.isString(where)) {
                whereStr = where;
            }

            return (whereStr === '') ? '' : ' WHERE ' + whereStr;
        },

        parseWhereItem: function(key, value) {
            var whereStr = '';
            var self = this;
            key = this.parseKey(key);

            if (_.isEmpty(value)) {
                return whereStr;
            }

            if (_.isArray(value)) {
                var last = _.last(value);
                var lk = 'AND';
                if (_.isString(last) && _.inArray(last.toUpperCase(), ['AND', 'OR', 'XOR'])) {
                    lk = last;
                    value.length = value.length - 1;
                }

                value.forEach(function(val, k) {
                    var parseStr = self.parseWhereItem(key, val);
                    if (parseStr.trim() !== '') {
                        whereStr += parseStr + ' ' + lk + ' ';
                    }
                });

                whereStr = '(' + whereStr.substr(0, (whereStr.length - lk.length - 1)).trim() + ')';
            } else if (_.isObject(value)) {
                var k = _.firstKey(value);

                if (/^(EQ|NEQ|GT|EGT|LT|ELT)$/i.test(k)) {
                    whereStr += key + ' ' + COMPARISON[k.toLowerCase()] + ' ' + self.parseValue(value[k]);
                } else if (/^(NOTLIKE|LIKE)$/i.test(k)) {
                    var likeStr = COMPARISON[k.toLowerCase()];
                    if (_.isObject(value[k])) {
                        var likes = {
                            OR: [],
                            AND: [],
                            XOR: []
                        }

                        // like: { or: ['%name%', '%hello%'], and: ['_xxx%'] }
                        _.forOwn(value[k], function(val, lk) {
                            lk = lk.toUpperCase();
                            if (_.inArray(lk, ['AND', 'OR', 'XOR'])) {
                                if (_.isArray(val)) {
                                    val.forEach(function(v) {
                                        likes[lk].push(key + ' ' + likeStr + ' ' + self.parseValue(v));
                                    });
                                } else if (_.isString(val)) {
                                    likes[lk].push(key + ' ' + likeStr + ' ' + self.parseValue(val));
                                }
                            }
                        });

                        _.forOwn(likes, function(like, lk) {
                            // do with order to join logic operator
                            if (lk == 'AND' && !_.isEmpty(like)) {
                                whereStr += 'AND ';
                            } else if (lk == 'XOR' && !_.isEmpty(like)) {
                                whereStr += 'XOR ';
                            }

                            whereStr += like.join(' ' + lk + ' ') + ' ';
                        });

                        whereStr = '(' + whereStr + ')';
                    } else if (_.isString(value[k])) {
                        whereStr += key + ' ' + likeStr + ' ' + this.parseValue(value[k]);
                    }
                } else if (k.toUpperCase() === 'EXP') {
                    if (_.isString(value[k])) {
                        whereStr += key + ' ' + value[k];
                    }
                } else if (/^(IN|NOTIN)$/i.test(k)) {
                    // age: { in: { exp: '(1, 2, 3, 4)' } }
                    if (_.isString(value[k]) || _.isArray(value[k])) {
                        if (_.isString(value[k])) {
                            value[k] = value[k].split(',');
                        }

                        whereStr += key + ' ' + COMPARISON[k.toLowerCase()] + ' (' + this.parseValue(value[k]).join(',') + ')';
                    } else if (_.isObject(value[k])) {
                        _.forOwn(value[k], function(v, ek) {
                            if (ek.toUpperCase() === 'EXP' && _.isString(v)) {
                                whereStr += key + ' ' + COMPARISON[k.toLowerCase()] + ' ' + v;
                            }
                        });
                    }
                } else if (/^(NOTBETWEEN|BETWEEN)$/i.test(k)) {
                    value[k] = _.isString(value[k]) ? value[k].split(',') : value[k];

                    if (_.isArray(value[k])) {
                        whereStr += key + ' ' + COMPARISON[k.toLowerCase()] + ' ' + this.parseValue(value[k][0]) + ' AND ' + this.parseValue(value[k][1]);
                    }
                } else {
                    throw new errors.DbError('Parse error, key[' + key + ']');
                }
            } else {
                whereStr += (key + ' = ' + this.parseValue(value));
            }

            return whereStr;
        },

        parseOrder: function(order) {
            var orderStr = [];
            var self = this;
            if (_.isArray(order)) {
                order.forEach(function(value) {
                    orderStr.push(self.parseKey(value));
                });
            } else if (_.isObject(order)) {
                _.forOwn(order, function(value, key) {
                    orderStr.push(self.parseKey(key) + ' ' + value);
                });
            } else if (_.isString(order)) {
                orderStr.push(order);
            }

            order = orderStr.join(',');

            return !_.isEmpty(order) ? ' ORDER BY ' + order : '';
        },

        parseLimit: function(limit) {
            return !_.isEmpty(parseInt(limit)) ? ' LIMIT ' + limit : '';
        },

        parseJoin: function(join) {
            var joinStr = '';

            if (!_.isEmpty(join)) {
                joinStr = ' ' + join.join(' ') + ' ';
            }

            return joinStr;
        },

        parseUnion: function(union) {
            if (_.isEmpty(union) || !_.isObject(union)) {
                return '';
            }

            var str = null;
            if (union._all) {
                str = 'UNION ALL ';
                delete union._all;
            } else {
                str = 'UNION ';
            }

            var sql = [];
            var self = this;
            _.forOwn(union, function(value) {
                sql.push(str + (_.isObject(value) ? self.buildSelectSql(value) : value));
            });

            return sql.join(' ');
        },

        parseGroup: function(group) {
            return !_.isEmpty(group) ? ' GROUP BY ' + group : '';
        },

        parseHaving: function(having) {
            return !_.isEmpty(having) ? ' HAVING ' + having : '';
        },

        parseLock: function(lock) {
            return !_.isEmpty(lock) ? ' FOR UPDATE ' : '';
        },

        parseComment: function(comment) {
            return _.isString(comment) ? '/* ' + comment + ' */' : '';
        },

        parseForce: function(index) {
            if (_.isArray(index) && !_.isEmpty(index)) {
                return ' FORCE INDEX ( ' + index.join(',') + ' )';
            }

            return '';
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
            }

            var tableStr = [];
            if (_.isArray(tables)) {
                tables.forEach(function(value) {
                    tableStr.push(self.parseKey(value));
                });
            } else if (_.isObject(tables)) {
                _.forOwn(tables, function(table, key) {
                    tableStr.push(self.parseKey(key) + ' AS ' + self.parseKey(table));
                });
            }

            return tableStr.join(',');
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

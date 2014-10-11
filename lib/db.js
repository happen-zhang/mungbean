
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
    var SELECT_SQL = 'SELECT%DISTINCT% %FIELD% FROM %TABLE%%JOIN%%WHERE%%GROUP%%HAVING%%ORDER%%LIMIT% %UNION%%COMMENT%';

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
                if (_.isObject(value)) {
                    value = _.mapKeys(value, function(k) {
                        return k.toUpperCase();
                    });

                    if (_.has(value, 'EXP')) {
                        fields.push(self.parseKey(key));
                        values.push(value.EXP);
                    }
                } else if (_.isScalar(value) || _.isNull(value)) {
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
                var limit = _.isNumber(parseInt(options.limit)) ? options.limit : LIST_ROWS;

                if (_.isArray(options.page)) {
                    page = options.page[0];
                    if (options.page[1]) {
                        listRows = options.page[1];
                    }
                } else if (_.isString(options.page) && options.page.indexOf(',') !== -1) {
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

        /**
         * Parse set.
         * @param  {Object} data Data
         * @return {String}      Set string
         */
        parseSet: function(data) {
            var set = [];
            var self = this;
            _.forOwn(data, function(value, key) {
                if (_.isObject(value)) {
                    value = _.mapKeys(value, function(k) {
                        return k.toUpperCase();
                    });

                    if (_.has(value, 'EXP')) {
                        set.push(self.parseKey(key) + '=' + value.EXP);
                    }
                } else if (_.isScalar(value)) {
                    set.push(self.parseKey(key) + '=' + self.parseValue(value));
                }
            });

            return ' SET ' + set.join(',');
        },

        parseDistinct: function(distinct) {
            return distinct ? ' DISTINCT ' : '';
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

        /**
         * Parse and return where sql.
         * @param  {Mix}    where Where options
         * @return {String}       Sql string
         */
        parseWhere: function(where) {
            var whereStr = '';

            if (_.isString(where)) {
                whereStr += where;
            } else if (_.isObject(where)) {
                var operator = null;
                var self = this;

                if (!_.isEmpty(where._logic) && _.isString(where._logic)) {
                    operator = where._logic.toUpperCase();
                }

                if (_.inArray(operator, ['AND', 'OR', 'XOR'])) {
                    operator = ' ' + operator + ' ';
                    delete where._logic;
                } else {
                    operator = ' AND ';
                }

                _.forOwn(where, function(value, field) {
                    field = field.trim();
                    if (field.indexOf('_') === 0) {
                        whereStr += self.parseThinkWhere(field, value);
                    } else if (/^[A-Z_\|\&\-.a-z0-9\(\)\,]+$/.test(field)) {
                        var orIndex = field.indexOf('|');
                        var andIndex = field.indexOf('&');

                        if (orIndex !== -1 && andIndex !== -1) {
                            var arrA = null;
                            var arrB = [];
                            var optrA = null;
                            var optrB = null;
                            var logicA = null;
                            var logicB = null;

                            if (orIndex < andIndex) {
                                optrA = '|';
                                optrB = '&';
                                logicA = ' OR ';
                                logicB = ' AND ';
                            } else if (andIndex < orIndex) {
                                optrA = '&';
                                optrB = '|';
                                logicA = ' AND ';
                                logicB = ' OR ';
                            }

                            arrA = field.split(optrA);
                            arrA.forEach(function(f, k) {
                                if (f.indexOf(optrB) !== -1) {
                                    f = f.split(optrB);

                                    arrA.push(f.shift());
                                    arrB = _.union(arrB, f);
                                    delete arrA[k];
                                    arrA = _.compact(arrA);
                                }
                            });

                            whereStr += '(';
                            var str = [];
                            arrA.forEach(function(f) {
                                str.push(self.parseWhereItem(self.parseKey(f), value));
                            });
                            whereStr += str.join(logicA);

                            str = [];
                            whereStr += logicB;
                            arrB.forEach(function(f) {
                                str.push(self.parseWhereItem(self.parseKey(f), value));
                            });
                            whereStr += str.join(logicB);

                            whereStr += ')';
                        } else if (andIndex !== -1 || orIndex !== -1) {
                            var logic = null;
                            var optr = null;

                            if (andIndex !== -1) {
                                optr = '&';
                                logic = ' AND ';
                            } else {
                                optr = '|';
                                logic = ' OR ';
                            }

                            var fields = field.split(optr);
                            var str = [];
                            var isMatch = _.isArray(value);
                            fields.forEach(function(f, index) {
                                if (isMatch) {
                                    if (_.isset(value[index])) {
                                        str.push(self.parseWhereItem(self.parseKey(f), value[index]));
                                    }
                                } else {
                                    str.push(self.parseWhereItem(self.parseKey(f), value));
                                }
                            });

                            if (!_.isEmpty(str)) {
                                whereStr += '(' + str.join(logic) + ')';
                            }
                        } else {
                            whereStr += self.parseWhereItem(field, value);
                        }
                    } else {
                        throw new errors.DbError('Expression error, key: [' + field + '].');
                    }

                    whereStr += !_.isEmpty(whereStr) ? operator : '';
                });

                whereStr = whereStr.substr(0, (whereStr.length - operator.length));
            }

            return !_.isEmpty(whereStr) ? ' WHERE ' + whereStr : '';
        },

        /**
         * Parse some special where conditions.
         * @param  {String} key Key
         * @param  {MXI}    val Value
         * @return {String}     Where sql
         */
        parseThinkWhere: function(key, val) {
            var whereStr = '';

            switch (key) {
                case '_string':
                    whereStr = val;
                    break ;

                case '_query':
                    if (!_.isString(val)) {
                        break ;
                    }

                    var where = val.split('&');
                    var logic = ' AND ';
                    var items = [];
                    var self = this;
                    where.forEach(function(item) {
                        if (item.indexOf('=') !== -1) {
                            var pair = item.split('=');
                            pair = pair.map(function(part) {
                                return part.trim();
                            });

                            if (pair[0].toLowerCase() == '_logic' && _.inArray(pair[1].toUpperCase(), ['OR', 'AND', 'XOR'])) {
                                logic = ' ' + pair[1].toUpperCase() + ' ';
                            } else {
                                items.push(self.parseKey(pair[0]) + '=' + self.parseValue(pair[1]));
                            }
                        }
                    });

                    whereStr = items.join(logic);
                    break ;

                case '_complex':
                    if (_.isString(val)) {
                        whereStr = val;
                    } else if (!_.isEmpty(val)) {
                        whereStr = this.parseWhere(val).substr(6);
                    }

                    break ;
            };

            return !_.isEmpty(whereStr) ? '(' + whereStr + ')' : '';
        },

        /**
         * Parse where item.
         * @param  {String} field Field name
         * @param  {MIX}    where Where itme
         * @return {String}       Where sql
         */
        parseWhereItem: function(field, where) {
            var whereStr = '';
            var self = this;
            field = this.parseKey(field);

            if (_.isEmpty(where) && !_.isScalar(where)) {
                return whereStr;
            }

            if (_.isArray(where)) {
                var last = _.last(where);
                var lk = 'AND';
                if (_.isString(last) && _.inArray(last.toUpperCase(), ['AND', 'OR', 'XOR'])) {
                    lk = last;
                    where.length = where.length - 1;
                }

                where.forEach(function(val, k) {
                    var parseStr = self.parseWhereItem(field, val);
                    if (parseStr.trim() !== '') {
                        whereStr += parseStr + ' ' + lk + ' ';
                    }
                });

                whereStr = '(' + whereStr.substr(0, (whereStr.length - lk.length - 1)).trim() + ')';
            } else if (_.isObject(where)) {
                var k = _.firstKey(where);
                var operator = COMPARISON[k.toLowerCase()];

                if (/^(EQ|NEQ|GT|EGT|LT|ELT)$/i.test(k) || /^(=|!=|>|>=|<|<=|<>)$/.test(k)) {
                    if (!operator) {
                        operator = k;
                    }

                    whereStr += this.parseComprison(field, operator, self.parseValue(where[k]));
                } else if (/^(NOTLIKE|LIKE)$/i.test(k)) {
                    whereStr += this.parseLike(field, operator, where[k]);
                } else if (k.toUpperCase() === 'EXP') {
                    whereStr += this.parseExpression(field, where[k]);
                } else if (/^(IN|NOTIN)$/i.test(k)) {
                    whereStr += this.parseIn(field, operator, where[k]);
                } else if (/^(NOTBETWEEN|BETWEEN)$/i.test(k)) {
                    whereStr += this.parseBetween(field, operator, where[k]);
                } else {
                    throw new errors.DbError('Parse error, key[' + field + ']');
                }
            } else {
                whereStr += (field + ' = ' + this.parseValue(where));
            }

            return whereStr;
        },

        /**
         * <, >, <>, <=, >=, =
         * @param  {String} field    Field name
         * @param  {String} operator Operator
         * @param  {Mix}    value    Value
         * @return {String}          Where item string
         */
        parseComprison: function(field, operator, value) {
            return field + ' ' + operator + ' ' + value;
        },

        /**
         * Like or not like.
         * @param  {String} field    Field name
         * @param  {String} operator Operator
         * @param  {Mix}    value    Value
         * @return {String}          Where item string
         */
        parseLike: function(field, operator, value) {
            var likeStr = '';
            var self = this;

            if (_.isObject(value)) {
                var likes = {
                    OR: [],
                    AND: [],
                    XOR: []
                }

                // like: { or: ['%name%', '%hello%'], and: ['_xxx%'] }
                _.forOwn(value, function(val, lk) {
                    lk = lk.toUpperCase();
                    if (_.inArray(lk, ['AND', 'OR', 'XOR'])) {
                        if (_.isArray(val)) {
                            val.forEach(function(v) {
                                likes[lk].push(field + ' ' + operator + ' ' + self.parseValue(v));
                            });
                        } else if (_.isString(val)) {
                            likes[lk].push(field + ' ' + operator + ' ' + self.parseValue(val));
                        }
                    }
                });

                _.forOwn(likes, function(like, lk) {
                    // do with order to join logic operator
                    if (lk == 'AND' && !_.isEmpty(like)) {
                        likeStr += 'AND ';
                    } else if (lk == 'XOR' && !_.isEmpty(like)) {
                        likeStr += 'XOR ';
                    }

                    likeStr += like.join(' ' + lk + ' ') + ' ';
                });

                likeStr = '(' + likeStr + ')';
            } else if (_.isString(value)) {
                // like: '%name%'
                likeStr += field + ' ' + operator + ' ' + this.parseValue(value);
            }

            return likeStr;
        },

        /**
         * Expression.
         * @param  {String} field    Field name
         * @param  {Mix}    value    Value
         * @return {String}          Where item string
         */
        parseExpression: function(field, value) {
            if (_.isString(value)) {
                return field + ' ' + value;
            }
        },

        /**
         * In or not in.
         * @param  {String} field    Field name
         * @param  {String} operator Operator
         * @param  {Mix}    value    Value
         * @return {String}          Where item string
         */
        parseIn: function(field, operator, value) {
            var inStr = '';

            // age: { in: { exp: '(1, 2, 3, 4)' } }
            if (_.isString(value) || _.isArray(value)) {
                if (_.isString(value)) {
                    value = value.split(',');
                    value = value.map(function(val) {
                        return val.trim();
                    });
                }

                var self = this;
                value = value.map(function(val) {
                    return self.parseValue(val);
                });

                inStr += field + ' ' + operator + ' (' + value.join(',') + ')';
            } else if (_.isObject(value)) {
                _.forOwn(value, function(v, ek) {
                    if (ek.toUpperCase() === 'EXP' && _.isString(v)) {
                        inStr += field + ' ' + operator + ' ' + v;
                    }
                });
            }

            return inStr;
        },

        /**
         * Between and not between.
         * @param  {String} field    Field name
         * @param  {String} operator Operator
         * @param  {Mix}    value    Value
         * @return {String}          Where item string
         */
        parseBetween: function(field, operator, value) {
            var betweenStr = '';

            value = _.isString(value) ? value.split(',') : value;
            if (_.isArray(value)) {
                value = value.map(function(val) {
                    return parseInt(val);
                });

                betweenStr += field + ' ' + operator + ' ' + this.parseValue(value[0]) + ' AND ' + this.parseValue(value[1]);
            }

            return betweenStr;
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
            return (_.isString(limit) && limit !== '') || _.isNumber(limit) ? ' LIMIT ' + limit : '';
        },

        parseJoin: function(join) {
            var joinStr = '';

            if (!_.isEmpty(join)) {
                joinStr = ' ' + join.join(' ') + ' ';
            }

            return joinStr;
        },

        parseUnion: function(union) {
            if (_.isEmpty(union) || !_.isArray(union)) {
                return '';
            }

            var str = null;
            if (_.last(union) === true) {
                str = 'UNION ALL ';
                union.pop();
            } else {
                str = 'UNION ';
            }

            var sql = [];
            var self = this;
            union.forEach(function(value) {
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
            return lock ? ' FOR UPDATE ' : '';
        },

        parseComment: function(comment) {
            return !_.isEmpty(comment) ? '/* ' + comment + ' */' : '';
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
            if (_.isObject(value)) {
                var value = _.mapKeys(value, function(key) {
                    return key.toUpperCase();
                });

                if (_.has(value, 'EXP') && _.isString(value.EXP)) {
                    value = this.escapeString(value.EXP);
                }
            } else if (_.isString(value)) {
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

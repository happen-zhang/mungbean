
'use strict';

var Class = require('cakes').Class;

var Db    = require('./db');
var _     = require('./utils');

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
        }
    }
});

module.exports = Model;


'use strict';

var Class = require('cakes').Class;

var _     = require('./utils');
var Model = require('./model');

/**
 * ORM warpper
 * @return {Function} Constructor
 */
var ThinkORM = Class(function() {

    var _modelInstances = {};

    return {

        __construct: function(config) {
            this.config = config;

            var identifier = _.serialize(config);
            if (!_modelInstances[identifier]) {
                _modelInstances[identifier] = {};
            }
        },

        /**
         * Create a model which map to table.
         * @param  {String}  modelName Name of model
         * @param  {Object}  prop      Extend or override Model method
         * @param  {Boolean} force     Force to get a new instance
         * @return {Object}            A model instance
         */
        model: function(modelName, prop, force) {
            var identifier = _.serialize(this.config);
            var curInstances = _modelInstances[identifier];

            if (curInstances && curInstances[modelName]) {
                if (!force) {
                    return curInstances[modelName];
                }

                curInstances[modelName] = null;
            }

            if (!curInstances) {
                _modelInstances[identifier] = {};
            }

            // table prefix
            var prefix = this.config.prefix;
            delete this.config.prefix;

            var m = new (Class(prop, Model))(modelName, prefix, this.config);
            _modelInstances[identifier][modelName] = m;

            return _modelInstances[identifier][modelName];
        }
    };
});

module.exports = ThinkORM;

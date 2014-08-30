
'use strict';

var _ = require('lodash');

var errors = require('../errors');

/**
 * If a value is deep equal null or undefined.
 * @param  {MIX}     value Value nedd to be test.
 * @return {Boolean}       If a value is null or undefined.
 */
_.isset = function(value) {
    var a = arguments,
        l = a.length,
        i = 0,
        undef;

    if (l === 0) {
        throw new errors.UtilError('Empty isset');
    }

     while (i !== l) {
        if (a[i] === undef || a[i] === null) {
          return false;
        }
        i++;
    }

    return true;
};

/**
 * Check value if a scalar.
 * @param  {MIX}     value Checked value
 * @return {Boolean}       Scalar value or not
 */
_.isScalar = function(value) {
    if (_.isNumber(value) || _.isBoolean(value) || _.isString(value)) {
        return true;
    }

    return false;
};

/**
 * Mapping object keys.
 * @param  {Object}   object   Object
 * @param  {Function} callback Callback
 * @return {Object}            Object keys has changed
 */
_.mapKeys = function(object, callback) {
    var keys = Object.keys(object);
    var length = keys.length;
    var newObject = {};
    var key = '';

    for (var i = 0; i < length; i++) {
        newObject[callback(keys[i])] = object[keys[i]];
    }

    return newObject;
};

/**
 * Php version in_array function.
 * @param  {MIX}     needle    Needle
 * @param  {Array}   haystack  Haystack
 * @param  {Boolean} argStrict If use strict
 * @return {Boolean}            In or not in
 */
_.inArray = function(needle, haystack, argStrict) {
    var key = '';
    var strict = !!argStrict;

    if (strict) {
        for (key in haystack) {
            if (haystack[key] === needle) {
                return true;
            }
        }
    } else {
        for (key in haystack) {
            if (haystack[key] == needle) {
                return true;
            }
        }
    }

    return false;
};

_.firstKey = function(object) {
    var key = '';

    if (_.isObject(object)) {
        for (var k in object) {
            if (object.hasOwnProperty(k)) {
                key = k;
                break ;
            }
        }
    }

    return key;
};

/**
 * Php version addslashes function.
 * @param  {String} str String value
 * @return {String}     Escaped value
 */
_.addslashes = function(str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
};

/**
 * Php version serialize function.
 * @param  {MIX}    mixedValue Value need to be serialized.
 * @return {String}            A result of serialized value.
 */
_.serialize = function (mixedValue) {
    var val, key, okey,
        ktype = '',
        vals = '',
        count = 0;

    function _utf8Size(str) {
        var size = 0,
            i = 0,
            l = str.length,
            code = '';

        for (i = 0; i < l; i++) {
            code = str.charCodeAt(i);
            if (code < 0x0080) {
                size += 1;
            } else if (code < 0x0800) {
                size += 2;
            } else {
                size += 3;
            }
        }

        return size;
    };

    function _getType(inp) {
        var match, key, cons, types, type = typeof inp;

        if (type === 'object' && !inp) {
            return 'null';
        }

        if (type === 'object') {
            if (!inp.constructor) {
                return 'object';
            }
            cons = inp.constructor.toString();
            match = cons.match(/(\w+)\(/);
            if (match) {
                cons = match[1].toLowerCase();
            }
            types = ['boolean', 'number', 'string', 'array'];
            for (key in types) {
                if (cons == types[key]) {
                    type = types[key];
                    break;
                }
            }
        }

        return type;
    };

    var type = _getType(mixedValue);

    switch (type) {
        case 'function':
            val = '';
            break;
        case 'boolean':
            val = 'b:' + (mixedValue ? '1' : '0');
            break;
        case 'number':
            val = (Math.round(mixedValue) == mixedValue ? 'i' : 'd') + ':' + mixedValue;
            break;
        case 'string':
            val = 's:' + _utf8Size(mixedValue) + ':"' + mixedValue + '"';
            break;
        case 'array':
        case 'object':
            val = 'a';
            for (key in mixedValue) {
                if (mixedValue.hasOwnProperty(key)) {
                    ktype = _getType(mixedValue[key]);
                    if (ktype === 'function') {
                        continue;
                    }

                    okey = (key.match(/^[0-9]+$/) ? parseInt(key, 10) : key);
                    vals += this.serialize(okey) + this.serialize(mixedValue[key]);
                    count++;
                }
            }
            val += ':' + count + ':{' + vals + '}';
            break;

        case 'undefined':
        default:
            val = 'N';
            break;
    }

    if (type !== 'object' && type !== 'array') {
        val += ';';
    }

    return val;
}

/**
 * Convert style of variable name.
 * @param  {String} name Variable name
 * @param  {Number} type Java style to C, or C style to Java
 * @return {String}      Converted variable name
 */
_.convertVarName = function(name, type) {
    if (1 === type) {
        name = name.replace(/_([a-zA-Z])/g, function(word) {
            return word[1].toUpperCase();
        });

        return name.charAt(0).toUpperCase() + name.substr(1);
    }

    name = name.replace(/([A-Z])/g, "_$1").toLowerCase();
    return '_' === name.charAt(0) ? name.substr(1) : name;
}

module.exports = _;

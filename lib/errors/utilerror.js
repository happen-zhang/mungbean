/**
 * UtilError
 * @param {String} message Error message.
 */
function UtilError(message) {
    this.message = message;
    this.stack = new Error().stack;
    this.type = this.name;
}

UtilError.prototype = Object.create(Error.prototype);
UtilError.prototype.name = 'UtilError';

module.exports = UtilError;

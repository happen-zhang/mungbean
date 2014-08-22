/**
 * MysqlError
 * @param {String} message Error message.
 */
function MysqlError(message) {
    this.message = message;
    this.stack = new Error().stack;
    this.type = this.name;
}

MysqlError.prototype = Object.create(Error.prototype);
MysqlError.prototype.name = 'MysqlError';

module.exports = MysqlError;

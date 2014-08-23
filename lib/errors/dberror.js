/**
 * DbError
 * @param {String} message Error message.
 */
function DbError(message) {
    this.message = message;
    this.stack = new Error().stack;
    this.type = this.name;
}

DbError.prototype = Object.create(Error.prototype);
DbError.prototype.name = 'DbError';

module.exports = DbError;

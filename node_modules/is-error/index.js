'use strict';

var objectToString = Object.prototype.toString;
var ERROR_TYPE = '[object Error]';

module.exports = isError;

function isError(err) {
    return objectToString.call(err) === ERROR_TYPE;
}

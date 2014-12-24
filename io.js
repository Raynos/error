'use strict';

module.exports = IOError;

function IOError(originalError, prefix) {
    var err = new Error(prefix + ': ' + originalError.message);

    Object.defineProperty(err, 'type', {
        value: 'error.IOError',
        configurable: true,
        enumerable: true
    });
    err.name = 'WrappedIOError';
    err.statusCode = 500;
    Object.defineProperty(err, 'original', {
        value: originalError,
        configurable: true,
        enumerable: false
    });
    return err;
}

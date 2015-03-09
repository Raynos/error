'use strict';

var extend = require('xtend');
var isError = require('is-error');
var assert = require('assert');

var TypedError = require('./typed.js');

module.exports = WrappedError;

function WrappedError(options) {
    assert(options, 'WrappedError: must specify options');
    assert(options.type, 'WrappedError: must specify type');
    assert(options.message, 'WrappedError: must specify message');

    assert(!has(options, 'original'),
        'WrappedError: original field is reserved');
    assert(!has(options, 'origMessage'),
        'WrappedError: origMessage field is reserved');

    var createTypedError = TypedError(options);

    return createError;

    function createError(originalError, opts) {
        assert(originalError, 'an error is required');
        assert(isError(originalError),
            'WrappedError: first argument must be an error');

        var err = createTypedError(extend(opts, {
            origMessage: originalError.message
        }));

        if (has(originalError, 'code') && !has(err, 'code')) {
            err.code = originalError.code;
        }

        if (has(originalError, 'errno') && !has(err, 'errno')) {
            err.errno = originalError.errno;
        }

        if (has(originalError, 'syscall') && !has(err, 'syscall')) {
            err.syscall = originalError.syscall;
        }

        Object.defineProperty(err, 'original', {
            value: originalError,
            configurable: true,
            enumerable: false
        });

        return err;
    }
}

function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

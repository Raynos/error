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

    assert(!has(options, 'cause'),
        'WrappedError: cause field is reserved');
    assert(!has(options, 'causeMessage'),
        'WrappedError: causeMessage field is reserved');
    assert(!has(options, 'origMessage'),
        'WrappedError: origMessage field is reserved');

    var createTypedError = TypedError(options);

    return createError;

    function createError(cause, opts) {
        assert(cause, 'an error is required');
        assert(isError(cause),
            'WrappedError: first argument must be an error');

        var err = createTypedError(extend(opts, {
            causeMessage: cause.message,
            origMessage: cause.message
        }));

        if (has(cause, 'code') && !has(err, 'code')) {
            err.code = cause.code;
        }

        if (has(cause, 'errno') && !has(err, 'errno')) {
            err.errno = cause.errno;
        }

        if (has(cause, 'syscall') && !has(err, 'syscall')) {
            err.syscall = cause.syscall;
        }

        Object.defineProperty(err, 'cause', {
            value: cause,
            configurable: true,
            enumerable: false
        });

        return err;
    }
}

function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

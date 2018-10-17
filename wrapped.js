'use strict';

var assert = require('assert');
var util = require('util');

var _util = require('./util'), has = _util.has, omitKey = _util.omitKey;
var TypedError = require('./typed.js');

var objectToString = Object.prototype.toString;
var ERROR_TYPE = '[object Error]';
var causeMessageRegex = /\{causeMessage\}/g;
var origMessageRegex = /\{origMessage\}/g;

module.exports = WrappedError;

function WrappedError(options) {
    assert(options, 'WrappedError: must specify options');
    assert(options.type, 'WrappedError: must specify type');
    assert(options.message, 'WrappedError: must specify message');

    assert(!has(options, 'cause'),
        'WrappedError: cause field is reserved');
    assert(!has(options, 'fullType'),
        'WrappedError: fullType field is reserved');
    assert(!has(options, 'causeMessage'),
        'WrappedError: causeMessage field is reserved');
    assert(!has(options, 'origMessage'),
        'WrappedError: origMessage field is reserved');

    var createTypedError = TypedError(options);
    Object.assign(createError, omitKey(options, 'name'));

    createError._name = options.name;
    Object.defineProperty(createError, 'name', { value: options.name, configurable: true });

    return createError;

    function createError(cause, opts) {
        /*eslint max-statements: [2, 25]*/
        assert(cause, 'an error is required');
        assert(isError(cause),
            'WrappedError: first argument must be an error');

        var causeMessage = cause.message;
        if (causeMessage.indexOf('{causeMessage}') >= 0) {
            // recover
            causeMessage = causeMessage.replace(
                causeMessageRegex,
                '$INVALID_CAUSE_MESSAGE_LITERAL'
            );
        }
        if (causeMessage.indexOf('{origMessage}') >= 0) {
            causeMessage = causeMessage.replace(
                origMessageRegex,
                '$INVALID_ORIG_MESSAGE_LITERAL'
            );
        }

        var nodeCause = false;
        var errOptions = Object.assign({}, opts, {
            causeMessage: causeMessage,
            origMessage: causeMessage
        });

        if (has(cause, 'code') && !has(errOptions, 'code')) {
            errOptions.code = cause.code;
        }

        if (has(cause, 'errno') && !has(errOptions, 'errno')) {
            errOptions.errno = cause.errno;
            nodeCause = true;
        }

        if (has(cause, 'syscall') && !has(errOptions, 'syscall')) {
            errOptions.syscall = cause.syscall;
            nodeCause = true;
        }

        var causeType = cause.type;
        if (!causeType && nodeCause) {
            causeType = 'error.wrapped-io.' +
                (cause.syscall || 'unknown') + '.' +
                (cause.errno || 'unknown');
        } else {
            causeType = 'error.wrapped-unknown';
        }

        errOptions.fullType = options.type + '~!~' +
            (cause.fullType || cause.type || causeType);

        var err = createTypedError(errOptions);

        Object.defineProperty(err, 'cause', {
            value: cause,
            configurable: true,
            enumerable: false
        });
        return err;
    }
}

function isError(err) {
    return util.isError(err) || objectToString.call(err) === ERROR_TYPE;
}

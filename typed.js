'use strict';

var template = require('string-template');
var assert = require('assert');

var _util = require('./util'), has = _util.has, omitKey = _util.omitKey;

var isWordBoundary = /[_.-](\w|$)/g;

module.exports = TypedError;

function TypedError(args) {
    assert(args, 'TypedError: must specify options');
    assert(args.type, 'TypedError: must specify options.type');
    assert(args.message, 'TypedError: must specify options.message');

    assert(!has(args, 'fullType'),
        'TypedError: fullType field is reserved');

    var message = args.message;
    if (args.type && !args.name) {
        var errorName = camelCase(args.type) + 'Error';
        args.name = errorName[0].toUpperCase() + errorName.substr(1);
    }

    Object.assign(createError, omitKey(args, 'name'));
    createError._name = args.name;
    Object.defineProperty(createError, 'name', { value: args.name, configurable: true });

    return createError;

    function createError(opts) {
        var result = new Error();

        Object.defineProperty(result, 'type', {
            value: result.type,
            enumerable: true,
            writable: true,
            configurable: true
        });

        var options = Object.assign({}, args, opts);
        if (!options.fullType) {
            options.fullType = options.type;
        }

        Object.assign(result, options);
        if (opts && opts.message) {
            result.message = template(opts.message, options);
        } else if (message) {
            result.message = template(message, options);
        }

        return result;
    }
}

function camelCase(str) {
    return str.replace(isWordBoundary, upperCase);
}

function upperCase(_, x) {
    return x.toUpperCase();
}

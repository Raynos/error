'use strict';

var template = require('string-template');
var extend = require('./extend');
var assert = require('assert');

var isWordBoundary = /[_.-](\w|$)/g;

module.exports = TypedError;

function TypedError(args) {
    assert(args, 'TypedError: must specify options');
    assert(args.type, 'TypedError: must specify options.type');
    assert(args.message, 'TypedError: must specify options.message');

    assert(!has(args, 'fullType'),
        'TypedError: fullType field is reserved');

    var message = args.message;
    var funcName = args.name
    if (!funcName) {
        var errorName = camelCase(args.type) + 'Error';
        funcName = errorName[0].toUpperCase() + errorName.substr(1);
    } else {
        delete args.name
    }

    extend(createError, args);
    createError._name = funcName;

    return createError;

    function createError(opts) {
        var result = new Error();

        Object.defineProperty(result, 'type', {
            value: result.type,
            enumerable: true,
            writable: true,
            configurable: true
        });

        var options = {}
        extend(options, args)
        extend(options, opts)
        if (!options.fullType) {
            options.fullType = options.type;
        }

        result.name = funcName
        extend(result, options);
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

function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

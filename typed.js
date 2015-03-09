'use strict';

var camelize = require('camelize');
var template = require('string-template');
var extend = require('xtend/mutable');

module.exports = TypedError;

function TypedError(args) {
    if (!args) {
        throw new Error('args is required');
    }
    if (!args.type) {
        throw new Error('args.type is required');
    }

    var message = args.message;

    if (args.type && !args.name) {
        var errorName = camelize(args.type) + 'Error';
        args.name = errorName[0].toUpperCase() + errorName.substr(1);
    }

    extend(createError, args);
    createError._name = args.name;

    return createError;

    function createError(opts) {
        var result = new Error();

        Object.defineProperty(result, 'type', {
            value: result.type,
            enumerable: true,
            writable: true,
            configurable: true
        });

        var options = extend({}, args, opts);

        extend(result, options);
        if (opts && opts.message) {
            result.message = template(opts.message, options);
        } else if (message) {
            result.message = template(message, options);
        }

        return result;
    }
}

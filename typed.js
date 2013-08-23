var format = require("util").format
var extend = require("xtend/mutable")

var slice = Array.prototype.slice

module.exports = TypedError

function TypedError(opts) {
    var message = opts.message

    return function createError() {
        var result = new Error()
        var args = slice.call(arguments)
        args.unshift(message)

        extend(result, opts)
        result.message = format.apply(null, args)

        return result
    }
}


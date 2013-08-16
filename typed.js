var format = require("util").format

var slice = Array.prototype.slice

module.exports = TypedError

function TypedError(message, type) {
    return function createError() {
        var result = new Error()
        var args = slice.call(arguments)
        args.unshift(message)

        result.message = format.apply(null, args)
        result.type = type

        return result
    }
}


module.exports = OptionError

function OptionError(message, options) {
    var result = new Error()

    result.option = options || null
    result.message = message
    result.type = "OptionError"

    return result
}


module.exports = ValidationError

function ValidationError(errors) {
    var result = new Error()

    result.errors = errors
    result.message = errors[0].message
    result.type = "ValidationError"

    return result
}


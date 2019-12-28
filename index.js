'use strict'

const assert = require('assert')

const stringTemplate = require('./string-template')

const lowerCaseKebabRegex = /([a-z])([0-9A-Z])/g
const upperCaseKebabRegex = /([A-Z])([A-Z])(?=[a-z])/g

const PLAIN_ERROR_FIELDS = [
  'code',
  'errno',
  'syscall',
  'status',
  'statusCode',
  'time',
  'hostname',
  'region',
  'requestId',
  'retryable',
  'description',
  'path',
  'actual',
  'expected',
  'operator'
]

class StructuredError extends Error {
  constructor (message, info) {
    super(message)
    assert(typeof message === 'string')
    assert(typeof info === 'object')

    this.name = this.constructor.name
    this.type = this.constructor.type
    this.__info = info
  }

  info () {
    return { ...this.__info }
  }

  toJSON () {
    return {
      ...this.__info,
      message: this.message,
      stack: this.stack,
      type: this.type,
      name: this.name
    }
  }

  static get type () {
    if (Object.prototype.hasOwnProperty.call(this, '__type')) {
      return this.__type
    }
    this.__type = createTypeStr(this.name)
    return this.__type
  }

  static create (messageTmpl, info) {
    assert(typeof messageTmpl === 'string')
    const msg = stringTemplate(messageTmpl, info)

    return new this(msg, info || null)
  }
}
exports.SError = StructuredError

class WrappedError extends Error {
  constructor (message, cause, info) {
    super(message)
    assert(typeof message === 'string')
    assert(typeof info === 'object')
    assert(cause && isError(cause))

    this.name = this.constructor.name
    this.type = this.constructor.type
    this.__info = info
    this.__cause = cause
  }

  fullType () {
    let causeType
    if (typeof this.__cause.fullType === 'function') {
      causeType = this.__cause.fullType()
    } else if (this.__cause.type) {
      causeType = this.__cause.type
    } else if (this.__cause.errno || this.__cause.syscall) {
      causeType = 'error.wrapped-io.' +
        (this.__cause.syscall || 'unknown') + '.' +
        (this.__cause.errno)
    } else {
      causeType = 'error.wrapped-unknown'
    }

    return this.type + '~!~' + causeType
  }

  cause () {
    return this.__cause
  }

  info () {
    return WrappedError.fullInfo(this.cause(), this.__info)
  }

  toJSON () {
    let causeJSON
    if (typeof this.__cause.toJSON === 'function') {
      causeJSON = this.__cause.toJSON()
    } else {
      causeJSON = getJSONForPlainError(this.__cause)
    }

    if (causeJSON.stack) {
      delete causeJSON.stack
    }

    return {
      ...this.info(),
      message: this.message,
      stack: this.stack,
      type: this.type,
      fullType: this.fullType(),
      name: this.name,
      cause: causeJSON
    }
  }

  static get type () {
    if (Object.prototype.hasOwnProperty.call(this, '__type')) {
      return this.__type
    }
    this.__type = createTypeStr(this.name)
    return this.__type
  }

  static fullStack (err) {
    return fullStack(err)
  }

  static findCauseByName (err, name) {
    return findCauseByName(err, name)
  }

  static fullInfo (cause, info) {
    let existing
    if (cause && typeof cause.info === 'function') {
      existing = cause.info()
    } else if (cause) {
      existing = getInfoForPlainError(cause)
    }

    if (existing) {
      Object.assign(existing, info)
      return existing
    }

    return { ...info }
  }

  static wrap (messageTmpl, cause, info) {
    assert(typeof messageTmpl === 'string')
    assert(cause && isError(cause))

    const msg = stringTemplate(
      messageTmpl,
      WrappedError.fullInfo(cause, info)
    )
    return new this(
      msg + ': ' + cause.message,
      cause,
      info || null
    )
  }
}
exports.WError = WrappedError

class MultiError extends Error {
  constructor (errors) {
    assert(Array.isArray(errors))
    assert(errors.length >= 1)
    for (const err of errors) {
      assert(isError(err))
    }

    let msg = 'First of ' + errors.length
    msg += ' error' + (errors.length > 1 ? 's' : '')
    msg += ': ' + errors[0].message

    super(msg)

    this.__errors = errors
    this.name = this.constructor.name
    this.type = createTypeStr(this.name) + '--' +
      errors[0].type || createTypeStr(errors[0].name)
  }

  errors () {
    return this.__errors.slice()
  }

  toJSON () {
    let out = []
    for (const e of this.__errors) {
      if (typeof e.toJSON === 'function') {
        const nestedJSON = e.toJSON()
        if (nestedJSON.stack) {
          delete nestedJSON.stack
        }
        out.push(nestedJSON)
      } else {
        out.push(getJSONForPlainError(e))
      }
    }
    return {
      message: this.message,
      stack: this.stack,
      type: this.type,
      name: this.name,
      errors: out
    }
  }

  static errorFromList (errors) {
    assert(Array.isArray(errors))

    if (errors.length === 0) {
      return null
    }
    if (errors.length === 1) {
      assert(isError(errors[0]))
      return errors[0]
    }
    return new this(errors)
  }
}
exports.MultiError = MultiError

function findCauseByName (err, name) {
  assert(isError(err))
  assert(typeof name === 'string')
  assert(name.length > 0)

  do {
    if (err.name === name) {
      return err
    }
    err = typeof err.cause === 'function' ? err.cause() : null
  } while (err)
  return null
}
exports.findCauseByName = findCauseByName

function fullStack (err) {
  assert(isError(err))

  if (typeof err.cause === 'function') {
    return err.stack + '\nCaused by: ' + fullStack(err.cause())
  }

  return err.stack
}
exports.fullStack = fullStack

function wrapf (messageTmpl, cause, info) {
  return WrappedError.wrap(messageTmpl, cause, info)
}
exports.wrapf = wrapf

function errorf (messageTmpl, info) {
  return StructuredError.create(messageTmpl, info)
}
exports.errorf = errorf

function createTypeStr (name) {
  if (name === 'SError') {
    return 'structured.error'
  } else if (name === 'WError') {
    return 'wrapped.error`'
  }

  return name
    .replace(lowerCaseKebabRegex, '$1.$2')
    .replace(upperCaseKebabRegex, '$1.$2')
    .toLowerCase()
}

function getInfoForPlainError (cause) {
  const info = {}
  for (const field of PLAIN_ERROR_FIELDS) {
    if (typeof cause[field] !== 'undefined') {
      info[field] = cause[field]
    }
  }
  return info
}

function isError (err) {
  return Object.prototype.toString.call(err) === '[object Error]'
}

function getJSONForPlainError (err) {
  let obj = getInfoForPlainError(err)
  Object.assign(obj, {
    message: err.message,
    type: err.type,
    name: err.name
  })
  return obj
}

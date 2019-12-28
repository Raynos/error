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

class SError extends Error {
  constructor (message, info) {
    super(message)
    assert(typeof message === 'string')
    assert(typeof info === 'object')

    this.name = this.constructor.name
    this.type = createTypeStr(this.name)
    this.__info = info
  }

  info () {
    return { ...this.__info }
  }

  cause () {
    return null
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
    return createTypeStr(this.name)
  }

  static create (messageTmpl, info) {
    assert(typeof messageTmpl === 'string')
    const msg = stringTemplate(messageTmpl, info)

    return new this(msg, info || null)
  }
}
exports.SError = SError

class WError extends Error {
  constructor (message, cause, info) {
    super(message)
    assert(typeof message === 'string')
    assert(typeof info === 'object')
    assert(cause && isError(cause))

    this.name = this.constructor.name
    this.type = createTypeStr(this.name)
    this.__info = info
    this.__cause = cause
  }

  cause () {
    return this.__cause
  }

  info () {
    const c = this.cause()
    let existing
    if (c && typeof c.info === 'function') {
      existing = c.info()
    } else if (c) {
      existing = getInfoForPlainError(c)
    }

    if (existing) {
      Object.assign(existing, this.__info)
      return existing
    }

    return { ...this.__info }
  }

  toJSON () {
    let causeJSON
    if (typeof this.__cause.toJSON === 'function') {
      causeJSON = this.__cause.toJSON()
    } else {
      causeJSON = getJSONForPlainError(this.__cause)
    }

    return {
      ...this.info(),
      message: this.message,
      stack: this.stack,
      type: this.type,
      name: this.name,
      cause: causeJSON
    }
  }

  static get type () {
    return createTypeStr(this.name)
  }

  static fullStack (err) {
    return fullStack(err)
  }

  static findCauseByName (err, name) {
    return findCauseByName(err, name)
  }

  static wrap (messageTmpl, cause, info) {
    assert(typeof messageTmpl === 'string')
    assert(cause && isError(cause))
    const msg = stringTemplate(messageTmpl, info)
    return new this(
      msg + '\ncause: ' + cause.message,
      cause,
      info || null
    )
  }
}
exports.WError = WError

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
    this.type = 'multi-error-' +
      errors[0].type || createTypeStr(errors[0].type)
  }

  errors () {
    return this.__errors.slice()
  }

  toJSON () {
    let out = []
    for (const e of this.__errors) {
      if (typeof e.toJSON === 'function') {
        out.push(e.toJSON())
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

function createTypeStr (name) {
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
    stack: err.stack,
    type: err.type,
    name: err.name
  })
  return obj
}
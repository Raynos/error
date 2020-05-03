'use strict'

const assert = require('assert')

/**
 * @typedef {import('./interfaces').CustomError} CustomError
 */

const nargs = /\{([0-9a-zA-Z_]+)\}/g
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

const typeNameCache = new Map()

class StructuredError extends Error {
  /**
   * @param {string} message
   * @param {object | null} info
   */
  constructor (message, info) {
    super(message)
    assert(typeof message === 'string')
    assert(info === null || typeof info === 'object')

    this.name = this.constructor.name
    this.type = getTypeNameCached(this.name)
    this.__info = info
  }

  info () {
    return { ...this.__info }
  }

  /** @returns {{ [k: string]: unknown }} */
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
    return getTypeNameCached(this.name)
  }

  /**
   * @param {string} messageTmpl
   * @param {object} [info]
   */
  static create (messageTmpl, info) {
    assert(typeof messageTmpl === 'string')
    const msg = stringTemplate(messageTmpl, info)

    return new this(msg, info || null)
  }
}
exports.SError = StructuredError

class WrappedError extends Error {
  /**
   * @param {string} message
   * @param {CustomError} cause
   * @param {object | null} info
   */
  constructor (message, cause, info) {
    super(message)
    assert(typeof message === 'string')
    assert(typeof info === 'object')
    assert(cause && isError(cause))

    this.name = this.constructor.name
    this.type = getTypeNameCached(this.name)
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

  /** @returns {{ [k: string]: unknown }} */
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
    return getTypeNameCached(this.name)
  }

  /**
   * @param {Error} err
   */
  static fullStack (err) {
    return fullStack(err)
  }

  /**
   * @param {Error} err
   * @param {string} name
   */
  static findCauseByName (err, name) {
    return findCauseByName(err, name)
  }

  /**
   * @param {CustomError} cause
   * @param {object | null} [info]
   */
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

  /**
   * @param {string} messageTmpl
   * @param {Error} cause
   * @param {object} [info]
   */
  static wrap (messageTmpl, cause, info) {
    assert(typeof messageTmpl === 'string')
    assert(cause && isError(cause))

    let msg = stringTemplate(
      messageTmpl,
      WrappedError.fullInfo(cause, info)
    )

    if (!info || !Reflect.get(info, 'skipCauseMessage')) {
      msg = msg + ': ' + cause.message
    }

    return new this(msg, cause, info || null)
  }
}
exports.WError = WrappedError

class MultiError extends Error {
  /**
   * @param {CustomError[]} errors
   */
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
      getTypeNameCached(errors[0].name)
  }

  errors () {
    return this.__errors.slice()
  }

  toJSON () {
    const out = []
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

  /**
   * @param {Error[]} errors
   * @returns {null | Error | MultiError}
   */
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

/**
 * @param {CustomError} err
 * @param {string} name
 */
function findCauseByName (err, name) {
  assert(isError(err))
  assert(typeof name === 'string')
  assert(name.length > 0)

  /** @type {CustomError | null} */
  let currentErr = err
  while (currentErr) {
    if (currentErr.name === name) {
      return currentErr
    }
    currentErr = typeof currentErr.cause === 'function'
      ? currentErr.cause() : null
  }
  return null
}
exports.findCauseByName = findCauseByName

/**
 * @param {CustomError} err
 * @returns {string}
 */
function fullStack (err) {
  assert(isError(err))

  if (typeof err.cause === 'function') {
    return err.stack + '\nCaused by: ' + fullStack(err.cause())
  }

  return err.stack || ''
}
exports.fullStack = fullStack

/**
 * @param {string} messageTmpl
 * @param {Error} cause
 * @param {object} info
 */
function wrapf (messageTmpl, cause, info) {
  return WrappedError.wrap(messageTmpl, cause, info)
}
exports.wrapf = wrapf

/**
 * @param {string} messageTmpl
 * @param {object} [info]
 */
function errorf (messageTmpl, info) {
  return StructuredError.create(messageTmpl, info)
}
exports.errorf = errorf

/**
 * @param {string} name
 * @returns {string}
 */
function getTypeNameCached (name) {
  if (typeNameCache.has(name)) {
    return typeNameCache.get(name)
  }

  const type = createTypeStr(name)
  typeNameCache.set(name, type)
  return type
}

/**
 * @param {string} name
 */
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

/**
 * @param {CustomError} cause
 */
function getInfoForPlainError (cause) {
  /** @type {{ [k: string]: unknown }} */
  const info = {}
  for (const field of PLAIN_ERROR_FIELDS) {
    const v = Reflect.get(cause, field)
    if (typeof v !== 'undefined') {
      info[field] = v
    }
  }
  return info
}

/**
 * @param {Error} err
 */
function isError (err) {
  return Object.prototype.toString.call(err) === '[object Error]'
}

/**
 * @param {Error} err
 */
function getJSONForPlainError (err) {
  const obj = getInfoForPlainError(err)
  Object.assign(obj, {
    message: err.message,
    type: getTypeNameCached(err.name),
    name: err.name
  })
  return obj
}

/**
 * Taken from https://www.npmjs.com/package/string-template.
 * source: https://github.com/Matt-Esch/string-template
 */
/**
 * @param {string} string
 */
function stringTemplate (string) {
  /** @type {{ [k: string]: unknown } | unknown[]} */
  var args

  if (arguments.length === 2 && typeof arguments[1] === 'object') {
    args = arguments[1]
  } else {
    args = new Array(arguments.length - 1)
    for (var i = 1; i < arguments.length; ++i) {
      args[i - 1] = arguments[i]
    }
  }

  if (!args || !args.hasOwnProperty) {
    args = {}
  }

  return string.replace(nargs, function replaceArg (match, i, index) {
    var result

    if (string[index - 1] === '{' &&
            string[index + match.length] === '}') {
      return i
    } else {
      result = i in args ? Reflect.get(args, i) : null
      if (result === null || result === undefined) {
        return ''
      }

      return result
    }
  })
}

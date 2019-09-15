// NOTE: we can't use "use strict" here
// otherwise we can't do "extend(fn, { length: null })"

module.exports = extend;

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend(target, source) {
    for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
            target[key] = source[key]
        }
    }
}

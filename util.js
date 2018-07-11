exports.has = function(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

exports.omitKey = function(obj, key) {
  return Object.keys(obj).reduce(function(o, k) {
    if (k !== key) o[k] = obj[k];
    return o;
  }, {});
}

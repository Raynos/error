module.exports = function _after(count, f) {
  var c = 0, results = [];

  if (count <= 0) {
    return f();
  } else {
    return function _callback() {
      switch (arguments.length) {
        case 0: break;
        case 1: results.push(arguments[0]); break;
        default: results.push(Array.prototype.slice.call(arguments)); break;
      }
      if (++c >= count) {
        f.apply(this, results);
      }
    };  
  }
};

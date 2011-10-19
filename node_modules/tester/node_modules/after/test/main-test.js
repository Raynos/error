var tester = require("tester"),
	assert = require('assert'),
	after = require('../after.js');

module.exports = {
	"after": function () {
		assert(after.length === 2);
		assert(typeof after === "function");
	},
	"after no arguments": function () {
		after(1, function () {
			assert(arguments.length === 0);
		})();
	},
	"after one argument": function () {
		["string", null, undefined, /foo/, [], {}, 1].forEach(function(val) {
			after(1, function(value) {
				assert(val === value);
			})(val);	
		});
	},
	"after multiple arguments": function () {
		var arr = ["lol", "foo", "baz"];
		after(1, function(array) {
			array.forEach(function (key) {
				assert(array[key] === arr[key]);
			})
		}).apply(null, arr); 
	},
	"after multiple calls": function () {
		var fs = [];
		for (var i = 1; i < 100; i++) {
			(function(i) {
				fs[i] = after(i, function() {
					assert(arguments.length === i);
					for (var j = 0; j < i; j++) {
						assert(j === arguments[j]);
					}
				});	
			}).call(null, i);
		}
		fs.forEach(function(v, k) {
			for (var i = 0; i < k; i++) {
				v(i);
			}
		});
	},
	"after(0, f)": function () {
		var bool = true;
		after(0, function firesImmediatly() {
			assert(bool);
		});
		bool = false;
	},
	"after (1, f)": function () {
		var f = after(1, function () {
			f.fired = true;
		});
		assert(!f.fired);
		f();
		assert(f.fired);
	},
	"after (n, f)": function () {
		var arr = [];
		for (var i = 1; i < 100; i++) {
			arr[i] = after(i, function() {
				arr[i].fired = true;
			});
		}
		arr.forEach(function(k, v) {
			for (var i = 1; i < k; i++) {
				v();
				if (i === k - 1) {
					assert(v.fired);
				} else {
					assert(!v.fired)
				}
			}
		});
	},
	"after async": function (done) {
		var bool = false;
		done(function () {
			assert(bool);
		});
		var f = after(1, function () {
			bool = true;
			done();
		});
		setTimeout(f, 100);
	}
}

if (!module.parent) {
	tester(module.exports);
}
var error = require("../src/error.js"),
	assert = require("assert");

module.exports = {
	"test error": function () {
		assert(error.passTo);
		assert(error.throw);
	},
	"test error.throw": function () {
		try {
			error.throw(function () { })("foo");
		} catch (e) {
			assert.equal(e, "foo")
		}

		var e = error.throw(function (err, f) { 
			return f;
		});

		assert.equal(e(null, 42), 42);
	},
	"test error.passTo": function () {
		var flag = false;

		f = error.passTo(function (err) {
			flag = err;
		}, function (a, b) { return b; });

		f(true);
		assert.equal(flag, true);
		assert.equal(f(null, 42), 42);
	}
};

if (!module.parent) {
	require("tester")(module.exports);
}
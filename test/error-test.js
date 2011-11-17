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
	},
	"test error.thrower": function () {
		var flag = false;

		try {
			error.thrower(true);
		} catch (e) {
			flag = true
		} finally {
			assert.equal(flag, true);
		}
	},
	"test error.whitelist": function () {
		var flag = false;

		function whitelist(err) {
			if (err.trusted) {
				return true;
			} else if (err.throw) {
				return false;
			}
		}
		function cb(err) {
			if (err === null || err.trusted) {
				flag = true;
			}
		}

		try {
			error.whitelist(whitelist, cb)({ throw: true, foo: true });
		} catch (e) {
			assert(e.foo);
		}
		error.whitelist(whitelist, cb)({});
		assert(!flag);
		error.whitelist(whitelist, cb)({ trusted: true });
		assert(flag);
		flag = false;
		error.whitelist(whitelist, cb)(null);
		assert(flag);
	}
};

if (!module.parent) {
	require("tester")(module.exports);
}
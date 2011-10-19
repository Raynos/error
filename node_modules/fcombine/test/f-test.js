var f = require("../src/f.js").extendNatives(true),
	assert = require("assert");

module.exports = {
	"test f exists": function () {
		assert(f);
		assert(f.post);
		assert(f.pre);
		assert(f.extendNatives);
		assert(f.combine);
		assert(f.compose);
	},
	"test extendNatives": function () {
		assert(Function.prototype.pre);
		assert(Function.prototype.post);
		var g = (function (a, b) {
			return a;
		}).pre(function (v) {
			v.foo = 42;
		}).post(function (v) {
			v.bar = 43;
		});

		var ret = g({});
		assert.equal(ret.foo, 42);
		assert.equal(ret.bar, 43);
		assert.equal(g.length, 2);
	},
	"test f.combine": function () {
		var f1 = function (a) {
			a.bar = 5;
			return a;
		};
		var f2 = function (a, b, c) {
			a.foo = 42;
			a.bar *= 2;
			return { "foo": 30, "bar": 2 };
		};

		var g = f.combine(f1, f2);

		var ret = g({});
		assert.equal(ret.foo, 42);
		assert.equal(ret.bar, 10);
		assert.equal(g.length, 1);

		g = f.combine(f1, f2, { pre: true });
		var ret = g({});
		assert.equal(ret.foo, 30);
		assert.equal(ret.bar, 2);
		assert.equal(g.length, 3);
	},
	"test f.compose": function () {
		var f1 = function (a, b) {
			return [a + b];
		};
		var f2 = function (a) {
			return a / 2;
		};

		var g = f.compose(f1,f2);
		assert.equal(g.length, 2);
		assert.equal(g(3,7), 5);
	},
	"test f.post and f.pre": function () {
		var f1 = function (o) {
			o.first = "f1";
			return "false";
		};
		var f2 = function (o, b) {
			o.first = "f2";
			return 42;
		};

		var g = f.pre(f1,f2);
		var o = {}
		var ret = g(o);
		assert.equal(g.length, 2)
		assert.equal(o.first, "f2");
		assert.equal(ret, 42);

		var g = f.post(f1, f2);
		var o = {}
		var ret = g(o);
		assert.equal(g.length, 1)
		assert.equal(o.first, "f2");
		assert.equal(ret, "false");
	}
};

if (!module.parent) {
    require("tester")(module.exports);
};

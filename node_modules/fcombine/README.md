# f <a name="_f" href="#_f"><small><sup>link</sup></small></a>

A function combination utility,

## Blog posts <a name="Blog_posts" href="#Blog_posts"><small><sup>link</sup></small></a>

Coming soon!

## Examples <a name="Examples" href="#Examples"><small><sup>link</sup></small></a>

 - [error annotated code][1] Coming soon!

## Documentation <a name="Documentation" href="#Documentation"><small><sup>link</sup></small></a>

Annotated source code coming soon.

### f.combine(f1, f2, flags) <a name="f.combine" href="#f.combine"><small><sup>link</sup></small></a>

`f.combine` combines two functions. It will return a new function that invokes the
two functions passed with `this` and `arguments`. 

The `flags` object is an optional hash to set the value `pre` to true. If `pre` is true then f1 comes before f2 and f2 is considered the main function otherwise f1 is the main function. The returned function's length property matches the length property of the main function. The returned function also only returns the return value of the main function

	var g = f.combine(function (a, b) {
		console.log("bar")
		return 42;
	}, function (a,b,c) {
		console.log("foo")
	});

	g(); // "bar", "foo", returns 42
	g.length === 2; // true

	var h = f.combine(function () {
		return "no value";
	}, function (a,b,c,d) {
		return "magic";
	}, { pre: true });

	h(); // "magic"
	h.length === 4; // true

### f.compose(f1, f2, flags)

`f.compose` composes two functions. It will return a new function that is the composition of f1 and f2. f1 is expected to return an array of arguments to pass 
to f2.

The optional `flags` hash can contain the `pre` flag to true which set's f2 to the main function, otherwise f1 is the main function. The returned function's length property is the same as the length property of the main function

	var g = f.compose(function addOne(val) {
		return [1, val];
	}, function (a, b) {
		return a + b;
	});

	g(5); // 6
	g.length === 1; // true

	var g = f.compose(function multiplyTwo(val) {
		return [2, val];
	}, function (a, b) {
		return a * b;
	}, { pre: true });

	g(5); // 10
	g.length === 2; // true

### f.post(f1, f2) 

Sugar for f.combine(f1, f2). Basically returns a new function where f2 comes after f1. (f1 being the main function)

### f.pre(f1, f2)

Sugar for f.combine(f1, f2, { pre: true }). Basically return a new function where f1 comes before f2. (f2 being the main function)

### f.extendNatives()

extends Native objects with sugar. Specifically Function.prototype.pre and Function.prototype.post are mapped to f.pre and f.post respectively. 

### Function.prototype.pre(f)

Calls f.pre(f, this) and returns a new function which calls f before this.

### Function.prototype.post(f)

Calls f.post(this, f) and returns a new function which calls f after this.

   [1]: github.com/raynos/error
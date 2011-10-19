var letters = "abcdefghijklmnopqrstuvwxyz".split("");

var f = {
	_construct: function _construct(len, source, f1, f2) {
		var argSig = letters.slice(0, len).join(',');

		return Function(
			"f1, f2",
			"return function(" + argSig + source
		)(f1, f2);
	},
	/*
		combine two functions. Returns a new function which is the 
			combination

		@param Function f1 - first function
		@param Function f2 - second function
		@param Object flags - a hash of flags
			{
				Boolean pre - A flag to say f1 comes before f2, meaning
					f2 is the main function, and the returned function
					should have .length match the length of f2.
			}

		@return Function - a new function that's the combination of 
			the two functions.
	*/
	combine: function _fcombine(f1, f2, flags)  {
		var len, source;
		if (flags && flags.pre) {
			len = f2.length;
			source = "){f1.apply(this, arguments);" +
				"return f2.apply(this, arguments); }";
		} else {
			len = f1.length;
			source = "){var ret = f1.apply(this, arguments);" +
				"f2.apply(this, arguments); return ret; }";
		}
		
		return this._construct(len, source, f1, f2);
	},
	/*
		compose two functions. Returns a new function which is the
			composition

		@param Function f1 - first function
		@param Function f2 - second function
		@param Object flags - a hash of flags
			{
				Boolean pre - A flag to say f1 comes before f2, meaning
					f2 is the main function, and the returned function
					should have .length match the length of f2.
			}
		
		@return Function - a new function that is the composition of
			the two functions
	*/
	compose: function _fcompose(f1, f2, flags) {
		var len, source;
		if (flags && flags.pre) {
			len = f2.length;
		} else {
			len = f1.length;
		}
		source = "){var arr = f1.apply(this, arguments);" +
			"return f2.apply(this, arr); }";

		return this._construct(len, source, f1, f2);
	},
	/*
		extend Natives with functions. Implements `Function.prototype.pre` and
			`Function.prototype.post`

		@param Boolean prototypes - flag to say whether prototypes should be
			extended as well.

		@return f
	*/
	extendNatives: function _extendNatives(prototypes) {
		if (!Function.prototype.pre && prototypes) {
			Object.defineProperty(Function.prototype, "pre", {
				value: function _pre(f1) {
					return f.pre(f1, this);
				},
				configurable: true
			});
		}
		if (!Function.prototype.post && prototypes) {
			Object.defineProperty(Function.prototype, "post", {
				value: function _post(f1) {
					return f.post(this, f1);
				},
				configurable: true
			});
		}
		return this;
	},
	/*
		combine two functions with g after f

		@param Function f - main function
		@param Function g - post function

		@return Function
	*/
	post: function _post(f, g) {
		return this.combine(f, g);
	},
	/*
		combine two functions with f before g.

		@param Function f - pre function
		@param Function g - main function

		@return Function
	*/
	pre: function _pre(f, g) {
		return this.combine(f, g, { pre: true });
	}
};

module.exports = f;
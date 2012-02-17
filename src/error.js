var f = require("fcombine");

var error = {
	/*
		return a new function which is the old function wrapped
			with error handling logic. The error handling logic
			will pass the error to the errorHandler if the error
			exists

		@param Function errorHandler - handles error
		@param Function cb - function to wrap

		@return Function
	*/
	passTo: function passTo(errorHandler, cb) {
		return proxy;

		function proxy(err) {
			if (err) {
				if (typeof errorHandler === "string") {
					return this[errorHandler].apply(this, arguments);
				}
				return errorHandler.apply(this, arguments);
			} else {
				return cb.apply(this, arguments);
			}
		}
	},
	/*
		return a new function which is the old function wrapped
			with error handling logic, to throw the error
			if it exists

		@param Function cb - function to wrap

		@return Function
	*/
	throw: function _throw(cb) {
		return f.pre(error.thrower, cb);
	},
	/*
		error throwing function. Takes one argument and if it exists
		it will throw it

		@param Object err - error to throw
	*/
	thrower: function (err) {
		if (err) {
			throw err;
		}
	},
	/*
		return a new function which will pass the arguments to the cb
		if the error is whitelisted and pass it to the errorHandler if 
		the error is not whitelisted

		@param Function whitelist - A function to be called with the error
			if it returns true then the error is whitelisted and the cb 
			is invoked. If it returns false then the errorHandler is invoked
			if it returns anything else then neither get invoked
		@param Function cb - invoked if the error is whitelisted
		@param Function [optional] errorHandler. errorHandler to be invoked
			the default value is error.thrower

		@return Function
	*/	
	whitelist: function (whitelist, cb, errorHandler) {
		errorHandler = errorHandler || error.thrower;

		return function _handleError(err) {
			var ret = (err === null ? true : whitelist(err));
			if (ret === true) {
				return cb.apply(this, arguments);
			} else if (ret === false) {
				return errorHandler.apply(this, arguments);
			}
		}
	}
}

module.exports = error;

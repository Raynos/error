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
	passTo: function _passTo(errorHandler, cb) {
		return function _handleError(err) {
			if (err) {
				return errorHandler(err);
			} else {
				return cb.apply(this, arguments);
			}
		};
	},
	/*
		return a new function which is the old function wrapped
			with error handling logic, to throw the error
			if it exists

		@param Function cb - function to wrap

		@return Function
	*/
	throw: function _throw(cb) {
		return f.pre(function _throw(err) {
			if (err) {
				throw err;
			}
		}, cb);
	}
}

module.exports = error;

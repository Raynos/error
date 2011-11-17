# error <a name="_error" href="#_error"><small><sup>link</sup></small></a>

An error handling utility,

## Blog posts

coming soon!

## Examples 

 - [rest annotated code][1] Coming soon!

## Documentation

Annotated source code coming soon.

### error.throw(cb)

Returns a function which will throw the first parameter if it exists

	error.throw(function (err, file) {
		// no error handling
		// error was thrown if exists
		// do things with file
	});

### error.passTo(errorHandler, cb)

Returns a function which will pass the error to the error handler if it exists
and if not it will call the callback

	error.passTo(next, function (err, data) {
		// no error handling.
		// error was passed to next if exists
		// handle data
	});

### error.thrower

A simple function that will throw the first argument if it exists

	error.passTo(error.thrower, function (err, data) {
		// ...
	});

### error.whitelist

A whitelisting function. Pass it a filter and a cb and an optional error handler.
If the filter returns true then invoke the cb, if it returns false invoke the error handler. If it returns neither don't do anything

	error.whitelist(function (err) {
		if (err.isSpecial) {
			return true;
		} else {
			return false;
		}
	}, function (err, data) {
		if (err.isSpecial) {
			handleIt();
		} else {
			handle(data);
		}
	});

   [1]: http://www.github.com/Raynos/rest
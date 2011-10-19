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

   [1]: http://www.github.com/Raynos/rest
# error

Wrap errors with more context.

## Inspiration

This module is inspired by the go error libraries that have simple
functions for creating & wrapping errors.

This is based on libraries like [eris][eris] & [pkg/errors][pkg-errors]

## Structured errors

```js
const { Serror } = require('error')

class ServerError extends Serror {}
class ClientError extends SError {}

const err = ServerError.create(
  '{title} server error, status={statusCode}', {
    title: 'some title',
    statusCode: 500
  }
)
const err2 = ClientError.create(
  '{title} client error, status={statusCode}', {
    title: 'some title',
    statusCode: 404
  }
)
```

## Wrapped Errors

```js
const net = require('net');
const { WError } = require('error')

class ServerListenError extends WError {}


var ServerListenFailedError = WrappedError({
    message: 'server: {origMessage}',
    type: 'server.listen-failed',
    requestedPort: null,
    host: null
});

var server = net.createServer();

server.on('error', function onError(err) {
  if (err.code === 'EADDRINUSE') {
    throw ServerListenFailedError.wrap(
      'error in server', err, {
        requestPort: 3000,
        host: null
      }
    )
  } else {
    throw err;
  }
});

server.listen(3000);
```

## Installation

`npm install error`

## Contributors

 - Raynos

## MIT Licenced

  [eris]: https://github.com/rotisserie/eris/tree/v0.1.0
  [pkg-errors]: https://github.com/pkg/errors

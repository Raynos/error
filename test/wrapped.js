'use strict';

var test = require('tape');
var net = require('net');

var WrappedError = require('../wrapped.js');

test('can create a wrapped error', function t(assert) {
    var ServerListenError = WrappedError({
        message: 'server: {origMessage}',
        type: 'server.listen-failed',
        requestedPort: null,
        host: null
    });

    var err = new Error('listen EADDRINUSE');
    err.code = 'EADDRINUSE';

    var err2 = ServerListenError(err, {
        requestedPort: 3426,
        host: 'localhost'
    });

    assert.equal(err2.message, 'server: listen EADDRINUSE');
    assert.equal(err2.requestedPort, 3426);
    assert.equal(err2.host, 'localhost');
    assert.equal(err2.code, 'EADDRINUSE');

    assert.equal(err2.original, err);

    assert.equal(err2.toString(),
        'ServerListenFailedError: server: listen EADDRINUSE');

    assert.equal(JSON.stringify(err2), JSON.stringify({
        type: 'server.listen-failed',
        message: 'server: listen EADDRINUSE',
        requestedPort: 3426,
        host: 'localhost',
        name: 'ServerListenFailedError',
        origMessage: 'listen EADDRINUSE',
        code: 'EADDRINUSE'
    }));

    assert.end();
});

test('can wrap real IO errors', function t(assert) {
    var ServerListenError = WrappedError({
        message: 'server: {origMessage}',
        type: 'server.listen-failed',
        requestedPort: null,
        host: null
    });

    var otherServer = net.createServer();
    otherServer.once('listening', onPortAllocated);
    otherServer.listen(0);

    function onPortAllocated() {
        var port = otherServer.address().port;

        var server = net.createServer();
        server.on('error', onError);

        server.listen(port);

        function onError(originalError) {
            var err = ServerListenError(originalError, {
                host: 'localhost',
                requestedPort: port
            });

            otherServer.close();
            assertOnError(err, originalError, port);
        }
    }

    function assertOnError(err, originalError, port) {
        assert.equal(err.message, 'server: listen EADDRINUSE');
        assert.equal(err.requestedPort, port);
        assert.equal(err.host, 'localhost');
        assert.equal(err.code, 'EADDRINUSE');

        assert.equal(err.original, originalError);

        assert.equal(err.toString(),
            'ServerListenFailedError: server: listen EADDRINUSE');

        assert.equal(JSON.stringify(err), JSON.stringify({
            type: 'server.listen-failed',
            message: 'server: listen EADDRINUSE',
            requestedPort: port,
            host: 'localhost',
            name: 'ServerListenFailedError',
            origMessage: 'listen EADDRINUSE',
            code: 'EADDRINUSE',
            errno: 'EADDRINUSE',
            syscall: 'listen'
        }));

        assert.end();
    }
});

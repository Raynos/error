'use strict';

var test = require('tape');

var isError = require('../index.js');

test('isError is a function', function t(assert) {
    assert.equal(typeof isError, 'function');
    assert.end();
});

test('returns true for error', function t(assert) {
    assert.equal(isError(new Error('foo')), true);
    assert.equal(isError(Error('foo')), true);
    assert.end();
});

test('returns false for non-error', function t(assert) {
    assert.equal(isError(null), false);
    assert.equal(isError(undefined), false);
    assert.equal(isError({ message: 'hi' }), false);
    assert.end();
});

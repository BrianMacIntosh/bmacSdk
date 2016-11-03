var assert = require('assert');
assert.approximatelyEqual = function (actual, expected) {
    if (!Math.approximatelyEqual(actual, expected)) {
        assert.fail(actual, expected, undefined, "~==");
    }
};

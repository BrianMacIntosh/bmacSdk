
var assert = require('assert');

interface assert
{
	approximatelyEqual(a: number, b: number): boolean;
}

assert.approximatelyEqual = function(actual: number, expected: number): void
{
	if (!Math.approximatelyEqual(actual, expected))
	{
		assert.fail(actual, expected, undefined, "~==");
	}
}
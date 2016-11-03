
var assert = require('assert');
require('../testutils');

require("../../polyfills/math");

//TODO: don't use || polyfills for tests

describe('Math', function() {
	describe('#sign()', function() {
		it('should return -1 for negative numbers', function() {
			assert.equal(Math.sign(-5), -1);
		});
		it('should return -1 for negative infinity', function() {
			assert.equal(Math.sign(Number.NEGATIVE_INFINITY), -1);
		});
		it('should return 1 for positive numbers', function() {
			assert.equal(Math.sign(5), 1);
		});
		it('should return 1 for infinity', function() {
			assert.equal(Math.sign(Number.POSITIVE_INFINITY), 1);
		});
		it('should return 0 for 0', function() {
			assert.equal(Math.sign(0), 0);
		});
		it('should return 0 for -0', function() {
			assert.equal(Math.sign(-0), 0);
		});
		it('should return NaN if val is not a number', function() {
			assert.ok(isNaN(Math.sign({})));
		});
	});

	describe('#clamp()', function() {
		it('should return a if val is less than a', function() {
			assert.approximatelyEqual(Math.clamp(0, 1, 2), 1);
		});
		it('should return b if val is greater than b', function() {
			assert.approximatelyEqual(Math.clamp(3, 1, 2), 2);
		});
		it('should return val if val is between a and b', function() {
			assert.approximatelyEqual(Math.clamp(1.5, 1, 2), 1.5);
		});
	});

	describe('#randomInt()', function() {
		it('should return values in the specified range', function() {
			for (var i = 0; i < 100; i++)
			{
				var rand = Math.randomInt(2);
				assert.ok(rand == 0 || rand == 1);
			}
		});
		it('should return values that are roughly evenly distributed', function() {
			var count = [0,0];
			for (var i = 0; i < 1000; i++)
			{
				var rand = Math.randomInt(2);
				count[rand]++;
			}
			assert.ok(Math.abs(count[0]-count[1]) < 100);
		});
		//TODO: what about negative param?
	});

	describe('#randomRange()', function() {
		it('should return values in the specified range', function() {
			for (var i = 0; i < 100; i++)
			{
				var rand = Math.randomRange(2, 4);
				assert.ok(rand == 2 || rand == 3);
			}
		});
		it('should return values that are roughly evenly distributed', function() {
			var count = [0,0,0,0];
			for (var i = 0; i < 1000; i++)
			{
				var rand = Math.randomRange(2, 4);
				count[rand]++;
			}
			assert.ok(Math.abs(count[2]-count[3]) < 100);
		});
		//TODO: what about negative param?
	});

	describe('#rad2Deg()', function() {
		it('should return the correct value', function() {
			assert.approximatelyEqual(Math.rad2Deg(0), 0);
			assert.approximatelyEqual(Math.rad2Deg(Math.PI), 180);
			assert.approximatelyEqual(Math.rad2Deg(Math.PI*3/2), 270);
			assert.approximatelyEqual(Math.rad2Deg(Math.PI*2), 360);
			assert.approximatelyEqual(Math.rad2Deg(Math.PI*5/2), 450);
		});
	});

	describe('#deg2Rad()', function() {
		it('should return the correct value', function() {
			assert.approximatelyEqual(Math.deg2Rad(0), 0);
			assert.approximatelyEqual(Math.deg2Rad(180), Math.PI);
			assert.approximatelyEqual(Math.deg2Rad(270), Math.PI*3/2);
			assert.approximatelyEqual(Math.deg2Rad(360), Math.PI*2);
			assert.approximatelyEqual(Math.deg2Rad(450), Math.PI*5/2);
		});
	});

	describe('#isAngleBetween()', function() {
		it('should work in normal cases', function() {
			assert.equal(Math.isAngleBetween(0.1, 0.5, 6.0), false);
			assert.equal(Math.isAngleBetween(3.0, 0.5, 6.0), true);
		});
		it('should work across the origin', function() {
			assert.equal(Math.isAngleBetween(0.1, 6.0, 0.5), true);
			assert.equal(Math.isAngleBetween(3.0, 6.0, 0.5), false);
		});
		it('should wrap the test angle', function() {
			assert.equal(Math.isAngleBetween(3.0+Math.PI*2, 0.5, 6.0), true);
			assert.equal(Math.isAngleBetween(0.1+Math.PI*2, 0.5, 6.0), false);
		});
		it('should wrap the bounds angles', function() {
			assert.equal(Math.isAngleBetween(3.0, 0.5+Math.PI*2, 6.0), true);
			assert.equal(Math.isAngleBetween(0.1, 0.5+Math.PI*2, 6.0), false);

			assert.equal(Math.isAngleBetween(3.0, 0.5, 6.0+Math.PI*2), true);
			assert.equal(Math.isAngleBetween(0.1, 0.5, 6.0+Math.PI*2), false);
		});
	});

	describe('#angleDifference()', function() {
		it('should work in normal cases', function() {
			assert.approximatelyEqual(Math.angleDifference(0.1, 0.6), -0.5);
			assert.approximatelyEqual(Math.angleDifference(0.6, 0.1), 0.5);
		});
		it('should wrap the operands', function() {
			assert.approximatelyEqual(Math.angleDifference(0.1+Math.PI*2, 0.6), -0.5);
			assert.approximatelyEqual(Math.angleDifference(0.6, 0.1+Math.PI*2), 0.5);

			assert.approximatelyEqual(Math.angleDifference(0.1, -0.4), 0.5);
			assert.approximatelyEqual(Math.angleDifference(-0.4, 0.1), -0.5);
		});
	});

	describe('#unsignedMod()', function() {
		it('should work in normal cases', function() {
			assert.approximatelyEqual(Math.unsignedMod(0.1, 1), 0.1);
			assert.approximatelyEqual(Math.unsignedMod(1.1, 1), 0.1);
			assert.approximatelyEqual(Math.unsignedMod(2.1, 1), 0.1);
		});
		it('should work with a negative base', function() {
			assert.approximatelyEqual(Math.unsignedMod(0.1, -1), 0.1);
			assert.approximatelyEqual(Math.unsignedMod(1.1, -1), 0.1);
			assert.approximatelyEqual(Math.unsignedMod(2.1, -1), 0.1);
		});
		it('should return a positive value even if operand is negative', function() {
			assert.approximatelyEqual(Math.unsignedMod(-0.1, 1), 0.1);
			assert.approximatelyEqual(Math.unsignedMod(-1.1, 1), 0.1);
			assert.approximatelyEqual(Math.unsignedMod(-2.1, 1), 0.1);
		});
		it('should return NaN if the base is 0', function() {
			assert.ok(isNaN(Math.unsignedMod(0.1, 0)));
		});
	});

	describe('#approximatelyEqual()', function() {
		it('should return true for equal numbers', function() {
			assert.ok(Math.approximatelyEqual(1, 1));
			assert.ok(Math.approximatelyEqual(1000000, 1000000));
			assert.ok(Math.approximatelyEqual(-1, -1));
			assert.ok(Math.approximatelyEqual(-1000000, -1000000));
		});
		it('should return true for approx equal numbers', function() {
			assert.ok(Math.approximatelyEqual(0.1, 1.1-1));
			assert.ok(Math.approximatelyEqual(1, 1.0000000000000002));
		});
		it('should return false for not equal numbers', function() {
			assert.ok(!Math.approximatelyEqual(0.1, 0.2));
			assert.ok(!Math.approximatelyEqual(1, -1));
			assert.ok(!Math.approximatelyEqual(1, 1.0000000000000004));
		});
	});
});
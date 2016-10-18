
interface Math
{
	/**
	 * Returns -1, 0, or 1 based on the sign of the number.
	 */
	sign(val: number): number;

	/**
	 * Returns min(b, max(a, val)).
	 */
	clamp(val: number, a: number, b: number): number;

	/**
	 * Returns a random integer in the range [0, upperBound).
	 */
	randomInt(upperBoundExclusive: number): number;

	/**
	 * Returns a random float in the range [min, max).
	 */
	randomRange(minInclusive: number, maxExclusive: number): number;

	/**
	 * Converts the specified angle in radians to degrees.
	 */
	rad2Deg(rad: number): number;

	/**
	 * Converts the specified angle in degrees to radians.
	 */
	deg2Rad(deg: number): number;

	/**
	 * Returns true if the angle n (radians) is between the angles a and b (radians).
	 */
	isAngleBetween(n: number, a: number, b: number): boolean

	/**
	 * Returns the delta from angle a to angle b.
	 */
	angleDifference(a: number, b: number): number;

	/**
	 * Returns the unsigned module of the specified number in the specified base.
	 */
	unsignedMod(a: number, base: number): number
}

Math.sign = Math.sign || function(val: number): number
{
	if (val < 0)
		return -1;
	else if (val > 0)
		return 1;
	else
		return 0;
}

Math.clamp = Math.clamp || function(val: number, a: number, b: number): number
{
	if (val < a) return a;
	if (val > b) return b;
	return val;
}

Math.randomInt = Math.randomInt || function(upperBoundExclusive: number): number
{
	return Math.floor(Math.random() * upperBoundExclusive);
}

Math.randomRange = Math.randomRange || function(minInclusive: number, maxExclusive: number): number
{
	return Math.randomInt(maxExclusive-minInclusive)+minInclusive;
}

/**
 * Converts the specified angle in radians to degrees.
 * @param {number} rad
 */
Math.rad2Deg = Math.rad2Deg || function(rad: number): number
{
	return (rad / Math.PI) * 180;
}

/**
 * Converts the specified angle in degrees to radians.
 * @param {number} deg
 */
Math.deg2Rad = Math.deg2Rad || function(deg: number): number
{
	return (deg / 180) * Math.PI;
}

//Robert Eisele
Math.isAngleBetween = function(n: number, a: number, b: number): boolean
{
	var circle = Math.PI*2;
	n = (circle + (n % circle)) % circle;
	a = (circle*100 + a) % circle;
	b = (circle*100 + b) % circle;
	
	if (a < b)
		return a <= n && n <= b;
	return a <= n || n <= b;
}

Math.angleDifference = function(a: number, b: number): number
{
	return Math.unsignedMod(b - a + Math.PI, Math.PI * 2) - Math.PI;
}

Math.unsignedMod = function(n: number, base: number): number
{
	return n - Math.floor(n/base) * base;
}

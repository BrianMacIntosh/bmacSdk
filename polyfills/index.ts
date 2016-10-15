
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

interface String
{
	/**
	 * Removes whitespace characters from the start and end of the string.
	 */
	trim(): string;

	/**
	 * Removes whitespace characters from the start of the string.
	 */
	trimStart(): string;

	/**
	 * Removes whitespace characters from the end of the string.
	 */
	trimEnd(): string;

	/**
	 * Returns the djb2 32-bit signed integer hash of the string.
	 */
	djb2Hash(): number;
}

String.prototype.trim = String.prototype.trim || function trim(): string
{
	return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

String.prototype.trimStart = String.prototype.trimStart || function trimStart(): string
{
	return this.replace(/^\s\s*/, '');
};

String.prototype.trimEnd = String.prototype.trimEnd || function trimEnd(): string
{
	return this.replace(/\s\s*$/, '');
};

String.prototype.djb2Hash = String.prototype.djb2Hash || function djb2Hash(): number
{
	var hash = 5381;
	for (var i = 0; i < this.length; i++)
	{
		var char = this.charCodeAt(i);
		hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
		hash = hash & hash; //force to 32-bit int (thanks JS)
	}
	return hash;
}

interface Array<T>
{
	/**
	 * Removes the specified object from the array. Returns true if the object was found and removed.
	 */
	remove(object: T): boolean;

	/**
	 * Returns true if the array contains the specified object.
	 */
	contains(object: T): boolean;

	/**
	 * Adds the element in the first empty space in the array. Returns the index used.
	 * @param {number} min The minimum index to use.
	 */
	addInFirstSpace(object: T, min: number): number
}

Array.prototype.remove = Array.prototype.remove || function remove(object): boolean
{
	for (var c = 0; c < this.length; c++)
	{
		if (this[c] === object)
		{
			this.splice(c, 1);
			return true;
		}
	}
	return false;
};

Array.prototype.contains = Array.prototype.contains || function contains(object): boolean
{
	for (var c = 0; c < this.length; c++)
	{
		if (this[c] === object)
		{
			return true;
		}
	}
	return false;
};

Array.prototype.addInFirstSpace = function addInFirstSpace(object, min: number): number
{
	for (var c = min; c < this.length; c++)
	{
		if (this[c] === undefined || this[c] === null)
		{
			this[c] = object;
			return c;
		}
	}

	var index = Math.max(min, this.length);
	this[index] = object;
	return index;
};

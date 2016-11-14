
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

	/**
	 * Adds all elements in the specified array to this one.
	 */
	addRange(other: any[]): void;
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

Array.prototype.addRange = function addRange(other: any[]): void
{
	for (var i = 0; i < other.length; i++)
	{
		this.push(other[i]);
	}
}

Array.isArray = Array.isArray || function isArray(arg: any): arg is Array<any>
{
	return arg instanceof Array;
}


require("./tweening");
require("./math");

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

	/**
	 * Returns true if the string ends with the specified string.
	 */
	endsWith(searchString: string, position?: number): boolean;
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

String.prototype.endsWith = String.prototype.endsWith || function(searchString: string, position?: number): boolean
{
	var subjectString = this.toString();
	if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length)
	{
		position = subjectString.length;
	}
	position -= searchString.length;
	var lastIndex = subjectString.lastIndexOf(searchString, position);
	return lastIndex !== -1 && lastIndex === position;
};

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

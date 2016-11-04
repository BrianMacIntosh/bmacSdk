
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
	 * @param {number} position Pretend the string is only this long.
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


export class CircularQueue
{
	private head: number = 0;
	private tail: number = -1;

	public data: any[] = [];

	constructor(length: number)
	{
		this.data.length = length;
	};

	public getLength(): number
	{
		//TODO: is wrong when head and tail meet (overflow)
		return this.tail - this.head + 1;
	};

	/// Wrap an index so it falls in [0, length)
	/// ASSUMES index is is not less than -2*length
	private wrapIndex(index: number): number
	{
		return (index + 2*this.data.length) % this.data.length;
	};

	/**
	 * Push a new element at 'tail'
	 */
	public push(obj: any): void
	{
		var wasValid = this.valid();

		// add at tail
		this.tail = this.wrapIndex(this.tail + 1);
		this.data[this.tail] = obj;
		
		// we overwrote an existing element, tail pushes the head forward
		if (wasValid && this.tail == this.head)
		{
			this.head = this.wrapIndex(this.tail + 1);
		}
	};

	/**
	 * Remove all elements in range [head, index]
	 */
	public truncateTo(index: number): void
	{
		for (var i = this.head; ; i = this.wrapIndex(i + 1))
		{
			this.data[i] = null;
			if (i == index) break;
		}
		if (index == this.tail)
		{
			this.head = 0;
			this.tail = -1;
		}
		else
		{
			this.head = this.wrapIndex(index+1);
		}
	};

	public valid(): boolean
	{
		return this.tail >= 0 && this.head >= 0;
	}
}

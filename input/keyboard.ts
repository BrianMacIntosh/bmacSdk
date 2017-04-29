
export enum Key
{
	Left	= 37,
	Up		= 38,
	Right	= 39,
	Down	= 40,
	Space	= 32,
	PageUp	= 33,
	PageDown= 34,
	Tab		=  9,
	Escape	= 27,
	Enter	= 13,
	Shift	= 16,
	Ctrl	= 17,
	Alt		= 18,
}

export class Keyboard
{
	/**
	 * Read-only. Set if 'document' was not found.
	 * @type {boolean}
	 */
	public isHeadless: boolean = false;

	//stores current button state
	private keysDown: { [s: string]: boolean } = {};
	
	//buffers button changes for one frame
	private keysPressed: { [s: string]: boolean } = {};
	private keysReleased: { [s: string]: boolean } = {};
	private keysPressedBuffer: { [s: string]: boolean } = {};
	private keysReleasedBuffer: { [s: string]: boolean } = {};

	private boundKeyDown: any;
	private boundKeyUp: any;

	/**
	 * Called by the SDK to initialize keyboard listening.
	 */
	public _init()
	{
		if (typeof document !== "undefined")
		{
			this.boundKeyDown = this._onKeyDown.bind(this);
			this.boundKeyUp = this._onKeyUp.bind(this);
			document.addEventListener("keydown", this.boundKeyDown, false);
			document.addEventListener("keyup", this.boundKeyUp, false);
		}
		else
		{
			this.isHeadless = true;
		}
	};

	/**
	 * Called by the SDK to stop keyboard listening.
	 */
	public _destroy()
	{
		if (typeof document !== "undefined")
		{
			document.removeEventListener("keydown", this.boundKeyDown, false);
			document.removeEventListener("keyup", this.boundKeyUp, false);
		}
	};

	/**
	 * Called each frame by the SDK.
	 */
	public _update()
	{
		//cycle buffers
		var temp = this.keysPressed;
		this.keysPressed = this.keysPressedBuffer;
		this.keysPressedBuffer = temp;
		var temp = this.keysReleased;
		this.keysReleased = this.keysReleasedBuffer;
		this.keysReleasedBuffer = temp;
		
		//clear new buffer
		for (var i in this.keysPressedBuffer)
		{
			this.keysPressedBuffer[i] = false;
		}
		for (var i in this.keysReleasedBuffer)
		{
			this.keysReleasedBuffer[i] = false;
		}
		
		//update button down states
		for (var i in this.keysPressed)
		{
			//ignore repeats
			if (this.keysDown[i])
				this.keysPressed[i] = false;
			else if (this.keysPressed[i] && !this.keysReleased[i])
				this.keysDown[i] = true;
		}
		for (var i in this.keysReleased)
		{
			//ignore repeats
			if (!this.keysDown[i])
				this.keysReleased[i] = false;
			else if (this.keysReleased[i] && !this.keysPressed[i])
				this.keysDown[i] = false;
		}
	};

	private _onKeyDown(e)
	{
		e = e || window.event;
		this.keysPressedBuffer[e.keyCode] = true;
		
		// prevent scrolling
		if (e.keyCode == Key.Space || e.keyCode == Key.Tab)
		{
			e.preventDefault();
			return false;
		}
		else
		{
			return true;
		}
	};

	private _onKeyUp(e)
	{
		e = e || window.event;
		this.keysReleasedBuffer[e.keyCode] = true;
	};

	private _translateKey(code: string|Key|number): number
	{
		if (typeof code == 'string')
		{
			return (code as string).toUpperCase().charCodeAt(0);
		}
		else
		{
			return (code as number);
		}
	};

	/**
	 * Returns true on the first frame the specified key is pressed.
	 * @param {string|Key} code A character or a key scancode (see constant definitions).
	 * @returns {boolean}
	 */
	public keyPressed(code: string|Key): boolean
	{
		return !!this.keysPressed[this._translateKey(code)];
	};

	/**
	 * Returns true on the first frame the specified key is released.
	 * @param {string|Key} code A character or a key scancode (see constant definitions).
	 * @returns {boolean}
	 */
	public keyReleased(code: string|Key): boolean
	{
		return !!this.keysReleased[this._translateKey(code)];
	};

	/**
	 * Returns true if the specified key is down.
	 * @param {string|Key} code A character or a key scancode (see constant definitions).
	 * @returns {boolean}
	 */
	public keyDown(code: string|Key): boolean
	{
		return !!this.keysDown[this._translateKey(code)];
	};

	/**
	 * Returns true if the specified key is not down.
	 * @param {string|Key} code A character or a key scancode (see constant definitions).
	 * @returns {boolean}
	 */
	public keyUp(code: string|Key): boolean
	{
		return !this.keysDown[this._translateKey(code)];
	};

	/**
	 * Returns the number key pressed this frame, or -1 if none.
	 * @returns {number}
	 */
	public getNumberPressed(): number
	{
		for (var i = 48; i <= 57; i++)
		{
			if (this.keyPressed(i)) return i - 48;
		}
		return -1;
	};
};

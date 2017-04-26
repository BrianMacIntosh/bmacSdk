
import { ThreeManager } from "../threeutils";

export enum MouseButton
{
	Left	= 1,
	Middle	= 2,
	Right	= 3,
	Other	= 4,
}

export class Mouse
{
	/**
	 * Read-only. Set if 'document' was not found.
	 * @type {boolean}
	 */
	public isHeadless: boolean = false;

	public mousePos = { x: 0, y:0 };
	
	//stores current button state
	private mouseDown: { [s: string]: boolean } = {};
	
	//buffers button changes for one frame
	//duplicated in order to remember the states into the next frame
	private mousePressed: { [s: string]: boolean } = {};
	private mouseReleased: { [s: string]: boolean } = {};
	private mousePressedBuffer: { [s: string]: boolean } = {};
	private mouseReleasedBuffer: { [s: string]: boolean } = {};

	private wheelDelta: number = 0;
	private wheelDeltaBuffer: number = 0;

	private boundMouseMove: any;
	private boundDragOver: any;
	private boundMouseDown: any;
	private boundMouseUp: any;
	private boundMouseWheel: any;

	/**
	 * Called by the SDK to start listening to the mouse.
	 */
	public _init()
	{
		if (typeof document !== "undefined")
		{
			this.boundMouseMove = this._onMouseMove.bind(this);
			this.boundDragOver = this._onDragOver.bind(this);
			this.boundMouseDown = this._onMouseDown.bind(this);
			this.boundMouseUp = this._onMouseUp.bind(this);
			this.boundMouseWheel = this._onMouseWheel.bind(this);
			document.addEventListener("mousemove", this.boundMouseMove, false);
			document.addEventListener("dragover", this.boundDragOver, false);
			document.addEventListener("mousedown", this.boundMouseDown, false);
			document.addEventListener("mouseup", this.boundMouseUp, false);
			document.addEventListener("wheel", this.boundMouseWheel, false);
		}
		else
		{
			this.isHeadless = true;
		}
	};

	/**
	 * Called by the SDK to stop mouse listening.
	 */
	public _destroy()
	{
		if (typeof document !== "undefined")
		{
			document.removeEventListener("mousemove", this.boundMouseMove, false);
			document.removeEventListener("dragover", this.boundDragOver, false);
			document.removeEventListener("mousedown", this.boundMouseDown, false);
			document.removeEventListener("mouseup", this.boundMouseUp, false);
			document.removeEventListener("wheel", this.boundMouseWheel, false);
		}
	};

	/**
	 * Called by the SDK each frame to update the input state.
	 */
	public _update()
	{
		//cycle buffers
		var temp = this.mousePressed;
		this.mousePressed = this.mousePressedBuffer;
		this.mousePressedBuffer = temp;
		var temp = this.mouseReleased;
		this.mouseReleased = this.mouseReleasedBuffer;
		this.mouseReleasedBuffer = temp;

		this.wheelDelta = this.wheelDeltaBuffer;
		this.wheelDeltaBuffer = 0;
		
		//clear new buffer
		for (var i in this.mousePressedBuffer)
		{
			this.mousePressedBuffer[i] = false;
		}
		for (var i in this.mouseReleasedBuffer)
		{
			this.mouseReleasedBuffer[i] = false;
		}
		
		//update button down states
		for (var i in this.mousePressed)
		{
			if (this.mousePressed[i] && !this.mouseReleased[i])
				this.mouseDown[i] = true;
		}
		for (var i in this.mouseReleased)
		{
			if (this.mouseReleased[i] && !this.mousePressed[i])
				this.mouseDown[i] = false;
		}
	};

	private _onMouseMove(e)
	{
		e = e || window.event;
		this.mousePos.x = e.pageX;
		this.mousePos.y = e.pageY;
	};

	private _onDragOver(e)
	{
		e = e || window.event;
		this.mousePos.x = e.pageX,
		this.mousePos.y = e.pageY;
	}

	private _onMouseDown(e)
	{
		e = e || window.event;
		this.mousePressedBuffer[e.which || e.keyCode] = true;
	}

	private _onMouseUp(e)
	{
		e = e || window.event;
		this.mouseReleasedBuffer[e.which || e.keyCode] = true;
	}

	private _onMouseWheel(e)
	{
		e = e || window.event;
		this.wheelDeltaBuffer = e.wheelDelta;
	}

	/**
	 * Returns the mousewheel delta on this frame.
	 * @returns {number}
	 */
	public getMouseWheelDelta(): number
	{
		return this.wheelDelta;
	}

	/**
	 * Returns the current position of the mouse relative to the specified HTML element.
	 * @param {Element} relativeTo
	 * @param {THREE.Vector2} buffer Object to fill (optional)
	 * @returns {Object}
	 */
	public getPosition(relativeTo: HTMLElement, buffer?: THREE.Vector2): THREE.Vector2
	{
		if (!buffer) buffer = new THREE.Vector2();

		if (!relativeTo)
		{
			buffer.set(this.mousePos.x, this.mousePos.y);
			return buffer;
		}
		
		//Find global position of element
		var elemX = relativeTo.offsetLeft;
		var elemY = relativeTo.offsetTop;
		while ((relativeTo.offsetParent instanceof HTMLElement)
			&& (relativeTo = relativeTo.offsetParent as HTMLElement))
		{
			elemX += relativeTo.offsetLeft;
			elemY += relativeTo.offsetTop;
		}
		
		//Calculate relative position of mouse
		buffer.set(this.mousePos.x - elemX, this.mousePos.y - elemY);
		return buffer;
	};

	/**
	 * Returns true on the first frame the specified mouse button is pressed.
	 * @param {number} button See constant definitions.
	 * @returns {boolean}
	 */
	public buttonPressed(button: MouseButton): boolean
	{
		return !!this.mousePressed[button];
	};

	/**
	 * Returns true on the first frame the specified mouse button is released.
	 * @param {number} button See constant definitions.
	 * @returns {boolean}
	 */
	public buttonReleased(button: MouseButton): boolean
	{
		return !!this.mouseReleased[button];
	};

	/**
	 * Returns true if the specified mouse button is down.
	 * @param {number} button See constant definitions.
	 * @returns {boolean}
	 */
	public buttonDown(button: MouseButton): boolean
	{
		return !!this.mouseDown[button];
	};

	/**
	 * Returns true if the specified mouse button is not down.
	 * @param {number} button See constant definitions.
	 * @returns {boolean}
	 */
	public buttonUp(button: MouseButton): boolean
	{
		return !this.mouseDown[button];
	};
};

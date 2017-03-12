
import { ThreeUtils } from "../threeutils";

export namespace Mouse
{
	/**
	 * Read-only. Set if 'document' was not found.
	 * @type {boolean}
	 */
	export var isHeadless = false;

	export var mousePos = { x: 0, y:0 };
	
	//stores current button state
	var mouseDown: { [s: string]: boolean } = {};
	
	//buffers button changes for one frame
	//duplicated in order to remember the states into the next frame
	var mousePressed: { [s: string]: boolean } = {};
	var mouseReleased: { [s: string]: boolean } = {};
	var mousePressedBuffer: { [s: string]: boolean } = {};
	var mouseReleasedBuffer: { [s: string]: boolean } = {};

	var wheelDelta: number = 0;
	var wheelDeltaBuffer: number = 0;

	export enum Button
	{
		Left	= 1,
		Middle	= 2,
		Right	= 3,
		Other	= 4,
	}

	/**
	 * Called by the SDK to start listening to the mouse.
	 */
	export function _init()
	{
		if (typeof document !== "undefined")
		{
			document.addEventListener("mousemove", _onMouseMove, false);
			document.addEventListener("dragover", _onDragOver, false);
			document.addEventListener("mousedown", _onMouseDown, false);
			document.addEventListener("mouseup", _onMouseUp, false);
			document.addEventListener("wheel", _onMouseWheel, false);
		}
		else
		{
			isHeadless = true;
		}
	};

	/**
	 * Called by the SDK to stop mouse listening.
	 */
	export function _destroy()
	{
		if (typeof document !== "undefined")
		{
			document.removeEventListener("mousemove", _onMouseMove, false);
			document.removeEventListener("dragover", _onDragOver, false);
			document.removeEventListener("mousedown", _onMouseDown, false);
			document.removeEventListener("mouseup", _onMouseUp, false);
			document.removeEventListener("wheel", _onMouseWheel, false);
		}
	};

	/**
	 * Called by the SDK each frame to update the input state.
	 */
	export function _update()
	{
		//cycle buffers
		var temp = mousePressed;
		mousePressed = mousePressedBuffer;
		mousePressedBuffer = temp;
		var temp = mouseReleased;
		mouseReleased = mouseReleasedBuffer;
		mouseReleasedBuffer = temp;

		wheelDelta = wheelDeltaBuffer;
		wheelDeltaBuffer = 0;
		
		//clear new buffer
		for (var i in mousePressedBuffer)
		{
			mousePressedBuffer[i] = false;
		}
		for (var i in mouseReleasedBuffer)
		{
			mouseReleasedBuffer[i] = false;
		}
		
		//update button down states
		for (var i in mousePressed)
		{
			if (mousePressed[i] && !mouseReleased[i])
				mouseDown[i] = true;
		}
		for (var i in mouseReleased)
		{
			if (mouseReleased[i] && !mousePressed[i])
				mouseDown[i] = false;
		}
	};

	function _onMouseMove(e)
	{
		e = e || window.event;
		mousePos.x = e.pageX;
		mousePos.y = e.pageY;
	};

	function _onDragOver(e)
	{
		e = e || window.event;
		mousePos.x = e.pageX,
		mousePos.y = e.pageY;
	}

	function _onMouseDown(e)
	{
		e = e || window.event;
		mousePressedBuffer[e.which || e.keyCode] = true;
	}

	function _onMouseUp(e)
	{
		e = e || window.event;
		mouseReleasedBuffer[e.which || e.keyCode] = true;
	}

	function _onMouseWheel(e)
	{
		e = e || window.event;
		wheelDeltaBuffer = e.wheelDelta;
	}

	/**
	 * Returns the mousewheel delta on this frame.
	 * @returns {number}
	 */
	export function getMouseWheelDelta(): number
	{
		return wheelDelta;
	}

	/**
	 * Returns the current position of the mouse relative to the specified HTML element.
	 * @param {Element} relativeTo
	 * @param {THREE.Vector2} buffer Object to fill (optional)
	 * @returns {Object}
	 */
	export function getPosition(relativeTo: HTMLElement, buffer?: THREE.Vector2): THREE.Vector2
	{
		if (!buffer) buffer = ThreeUtils.newVector2();

		if (!relativeTo)
		{
			buffer.set(mousePos.x, mousePos.y);
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
		buffer.set(mousePos.x - elemX, mousePos.y - elemY);
		return buffer;
	};

	/**
	 * Returns true on the first frame the specified mouse button is pressed.
	 * @param {number} button See constant definitions.
	 * @returns {boolean}
	 */
	export function buttonPressed(button: Button): boolean
	{
		return !!mousePressed[button];
	};

	/**
	 * Returns true on the first frame the specified mouse button is released.
	 * @param {number} button See constant definitions.
	 * @returns {boolean}
	 */
	export function buttonReleased(button: Button): boolean
	{
		return !!mouseReleased[button];
	};

	/**
	 * Returns true if the specified mouse button is down.
	 * @param {number} button See constant definitions.
	 * @returns {boolean}
	 */
	export function buttonDown(button: Button): boolean
	{
		return !!mouseDown[button];
	};

	/**
	 * Returns true if the specified mouse button is not down.
	 * @param {number} button See constant definitions.
	 * @returns {boolean}
	 */
	export function buttonUp(button: Button): boolean
	{
		return !mouseDown[button];
	};
};

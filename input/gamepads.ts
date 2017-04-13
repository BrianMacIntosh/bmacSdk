
export enum GamepadButton
{
	A = 0,
	B = 1,
	X = 2,
	Y = 3,
	LeftShoulder = 4,
	RightShoulder = 5,
	LeftTrigger = 6,
	RightTrigger = 7,
	Back = 8,
	Start = 9,
	LeftStick = 10,
	RightStick = 11,
	DPadUp = 12,
	DPadDown = 13,
	DPadLeft = 14,
	DPadRight = 15,
	Home = 16,
}

export enum GamepadAxis
{
	LeftStickX = 0,
	LeftStickY = 1,
	RightStickX = 2,
	RightStickY = 3,
}

export class Gamepads
{
	/**
	 * Read-only. Set if gamepad data was not found.
	 * @type {boolean}
	 */
	public isHeadless: boolean = false;

	private STICK_THRESHOLD: number = 0.5;
	public DEAD_ZONE: number = 0.3;

	private gamepads: Gamepad[];
	private oldGamepads: Gamepad[];

	public _init()
	{

	};

	public _update()
	{
		if (typeof navigator !== "undefined" && navigator.getGamepads)
		{
			//HACK: so much garbage
			this.oldGamepads = this._cloneGamepadState(this.gamepads);
			this.gamepads = this._cloneGamepadState(navigator.getGamepads());
		}
		else
		{
			this.oldGamepads = undefined;
			this.gamepads = undefined;
			this.isHeadless = true;
		}
	};

	public _destroy()
	{

	};

	/**
	 * Gets raw information for the gamepad at the specified index.
	 * @param {number} index Gamepad index.
	 */
	public getGamepad(index: number): Gamepad
	{
		if (this.gamepads && this.gamepads[index])
			return this.gamepads[index];
		else
			return null;
	};

	/**
	 * Returns true if there is a gamepad at the specified index.
	 * @param {number} index Gamepad index.
	 * @returns {boolean}
	 */
	public gamepadExists(index: number): boolean
	{
		if (this.gamepads && this.gamepads[index])
			return true;
		else
			return false;
	};

	/**
	 * Returns true if there is a connected gamepad at the specified index.
	 * @param {number} index Gamepad index.
	 * @returns {boolean}
	 */
	public gamepadConnected(index: number): boolean
	{
		if (this.gamepads && this.gamepads[index] && this.gamepads[index].connected)
			return true;
		else
			return false;
	};

	/**
	 * Returns true on the frame the specified gamepad presses the specified button.
	 * @param {number} index Gamepad index.
	 * @param {number} button See constant definitions.
	 */
	public buttonPressed(index: number, button: GamepadButton): boolean
	{
		return this.buttonDown(index, button) && !this._buttonDownOld(index, button);
	};

	/**
	 * Returns true on the frame the specified gamepad releases the specified button.
	 * @param {number} index Gamepad index.
	 * @param {number} button See constant definitions.
	 */
	public buttonReleased(index: number, button: GamepadButton): boolean
	{
		return this.buttonUp(index, button) && !this._buttonUpOld(index, button);
	};

	/**
	 * Returns true if the specified button on the specified gamepad is not down.
	 * @param {number} index Gamepad index.
	 * @param {number} button See constant definitions.
	 */
	public buttonUp(index: number, button: GamepadButton): boolean
	{
		if (this.gamepads && this.gamepads[index] && this.gamepads[index].buttons.length > button)
			return !this.gamepads[index].buttons[button].pressed;
		else
			return false;
	};

	/**
	 * Returns true if the specified button on the specified gamepad is down.
	 * @param {number} index Gamepad index.
	 * @param {number} button See constant definitions.
	 */
	public buttonDown(index: number, button: GamepadButton): boolean
	{
		if (this.gamepads && this.gamepads[index] && this.gamepads[index].buttons.length > button)
			return this.gamepads[index].buttons[button].pressed;
		else
			return false;
	};

	private _buttonUpOld(index: number, button: GamepadButton): boolean
	{
		if (this.oldGamepads && this.oldGamepads[index] && this.oldGamepads[index].buttons.length > button)
			return !this.oldGamepads[index].buttons[button].pressed;
		else
			return false;
	};

	private _buttonDownOld(index: number, button: GamepadButton): boolean
	{
		if (this.oldGamepads && this.oldGamepads[index] && this.oldGamepads[index].buttons.length > button)
			return this.oldGamepads[index].buttons[button].pressed;
		else
			return false;
	};

	/**
	 * Returns the raw value of the specified gamepad button.
	 * @param {number} index Gamepad index.
	 * @param {number} button See constant definitions.
	 */
	public buttonValue(index: number, button: GamepadButton): number
	{
		if (this.gamepads && this.gamepads[index] && this.gamepads[index].buttons.length > button)
			return this.gamepads[index].buttons[button].value;
		else
			return 0;
	};

	/**
	 * Returns the value of the specified gamepad axis.
	 * @param {number} index Gamepad index.
	 * @param {number} axisIndex See constant definitions.
	 */
	public getAxis(index: number, axisIndex: GamepadAxis): number
	{
		if (this.gamepads && this.gamepads[index] && this.gamepads[index].axes.length > axisIndex)
		{
			var val = this.gamepads[index].axes[axisIndex];
			if (Math.abs(val) <= this.DEAD_ZONE) val = 0;
			return val;
		}
		else
			return 0;
	};

	private _getOldAxis(index: number, axisIndex: GamepadAxis): number
	{
		if (this.oldGamepads && this.oldGamepads[index] && this.oldGamepads[index].axes.length > axisIndex)
		{
			var val = this.oldGamepads[index].axes[axisIndex];
			if (Math.abs(val) <= this.DEAD_ZONE) val = 0;
			return val;
		}
		else
			return 0;
	};

	/**
	 * Returns 1 or -1 on the first frame the specified axis is pressed in that direction, or 0 if it isn't pressed.
	 * @param {number} index Gamepad index.
	 * @param {number} axisIndex See constant definitions.
	 */
	public axisPressed(index: number, axisIndex: GamepadAxis): number
	{
		if (this._getOldAxis(index, axisIndex) < this.STICK_THRESHOLD && this.getAxis(index, axisIndex) >= this.STICK_THRESHOLD)
			return 1;
		else if (this._getOldAxis(index, axisIndex) > -this.STICK_THRESHOLD && this.getAxis(index, axisIndex) <= -this.STICK_THRESHOLD)
			return -1;
		else
			return 0;
	};

	private _cloneGamepadState(source: Gamepad[]): Gamepad[]
	{
		if (!source) return null;
		
		var target = [];
		target.length = source.length;
		for (var i = 0; i < source.length; i++)
		{
			if (source[i])
			{
				var gamepad = source[i];
				var state: any = {};
				state.buttons = [];
				state.buttons.length = gamepad.buttons.length;
				state.axes = [];
				for (var a = 0; a < gamepad.axes.length; a++)
				{
					state.axes[a] = gamepad.axes[a];
				}
				for (var b = 0; b < gamepad.buttons.length; b++)
				{
					var obj = {pressed:gamepad.buttons[b].pressed, value:gamepad.buttons[b].value};
					state.buttons[b] = obj;
				}
				target[i] = state;
			}
			else
			{
				target[i] = null;
			}
		}
		return target;
	};
}

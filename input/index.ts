
import { Key, Keyboard } from "./keyboard";
import { MouseButton, Mouse } from "./mouse";
import { GamepadButton, GamepadAxis, Gamepads } from "./gamepads";

export { Key, Keyboard } from "./keyboard";
export { MouseButton, Mouse } from "./mouse";
export { GamepadButton, GamepadAxis, Gamepads } from "./gamepads";

export class Input
{
	public FIRST_PLAYER: number = 0; //TODO: dynamic

	public keyboard: Keyboard = new Keyboard();
	public mouse: Mouse = new Mouse();
	public gamepads: Gamepads = new Gamepads();

	/**
	 * Called by the SDK to initialize the input system.
	 */
	public _init()
	{
		this.keyboard._init();
		this.mouse._init();
		this.gamepads._init();
	};

	/**
	 * Called by the SDK to destroy the input system.
	 */
	public _destroy()
	{
		this.keyboard._destroy();
		this.mouse._destroy();
		this.gamepads._destroy();
	};

	/**
	 * Returns true if a 'left' control was pressed.
	 * @returns {boolean}
	 */
	public actionMenuLeft(): boolean
	{
		return this.keyboard.keyPressed(Key.Left) || this.keyboard.keyPressed("a")
			|| this.gamepads.axisPressed(this.FIRST_PLAYER, GamepadAxis.LeftStickX) < 0
			|| this.gamepads.buttonPressed(this.FIRST_PLAYER, GamepadButton.DPadLeft);
	};

	/**
	 * Returns true if a 'right' control was pressed.
	 * @returns {boolean}
	 */
	public actionMenuRight(): boolean
	{
		return this.keyboard.keyPressed(Key.Right) || this.keyboard.keyPressed("d")
			|| this.gamepads.axisPressed(this.FIRST_PLAYER, GamepadAxis.LeftStickX) > 0
			|| this.gamepads.buttonPressed(this.FIRST_PLAYER, GamepadButton.DPadRight);
	};

	/**
	 * Returns true if an 'up' control was pressed.
	 * @returns {boolean}
	 */
	public actionMenuUp(): boolean
	{
		return this.keyboard.keyPressed(Key.Up) || this.keyboard.keyPressed("w")
			|| this.gamepads.axisPressed(this.FIRST_PLAYER, GamepadAxis.LeftStickY) < 0
			|| this.gamepads.buttonPressed(this.FIRST_PLAYER, GamepadButton.DPadUp);
	};

	/**
	 * Returns true if a 'down' control was pressed.
	 * @returns {boolean}
	 */
	public actionMenuDown(): boolean
	{
		return this.keyboard.keyPressed(Key.Down) || this.keyboard.keyPressed("s")
			|| this.gamepads.axisPressed(this.FIRST_PLAYER, GamepadAxis.LeftStickY) > 0
			|| this.gamepads.buttonPressed(this.FIRST_PLAYER, GamepadButton.DPadDown);
	};

	/**
	 * Returns true if an 'accept' control was pressed.
	 * @returns {boolean}
	 */
	public actionMenuAccept(): boolean
	{
		return this.keyboard.keyPressed(Key.Space) || this.keyboard.keyPressed(Key.Enter)
			|| this.gamepads.buttonPressed(this.FIRST_PLAYER, GamepadButton.A);
	};

	/**
	 * Returns true if a 'cancel' control was pressed.
	 * @returns {boolean}
	 */
	public actionMenuCancel(): boolean
	{
		return this.keyboard.keyPressed(Key.Escape)
			|| this.gamepads.buttonPressed(this.FIRST_PLAYER, GamepadButton.B);
	};

	/**
	 * Returns true if a 'pause' control was pressed.
	 * @returns {boolean}
	 */
	public actionGamePause(): boolean
	{
		return this.keyboard.keyPressed(Key.Escape)
			|| this.gamepads.buttonPressed(this.FIRST_PLAYER, GamepadButton.Start);
	};

	/**
	 * Called by the SDK each frame.
	 */
	public _update(): void
	{
		this.keyboard._update();
		this.mouse._update();
		this.gamepads._update();
	};
};

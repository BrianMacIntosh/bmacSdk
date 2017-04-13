"use strict";
exports.__esModule = true;
var keyboard_1 = require("./keyboard");
var mouse_1 = require("./mouse");
var gamepads_1 = require("./gamepads");
var keyboard_2 = require("./keyboard");
exports.Key = keyboard_2.Key;
exports.Keyboard = keyboard_2.Keyboard;
var mouse_2 = require("./mouse");
exports.MouseButton = mouse_2.MouseButton;
exports.Mouse = mouse_2.Mouse;
var gamepads_2 = require("./gamepads");
exports.GamepadButton = gamepads_2.GamepadButton;
exports.GamepadAxis = gamepads_2.GamepadAxis;
exports.Gamepads = gamepads_2.Gamepads;
var Input = (function () {
    function Input() {
        this.FIRST_PLAYER = 0; //TODO: dynamic
        this.keyboard = new keyboard_1.Keyboard();
        this.mouse = new mouse_1.Mouse();
        this.gamepads = new gamepads_1.Gamepads();
    }
    /**
     * Called by the SDK to initialize the input system.
     */
    Input.prototype._init = function () {
        this.keyboard._init();
        this.mouse._init();
        this.gamepads._init();
    };
    ;
    /**
     * Called by the SDK to destroy the input system.
     */
    Input.prototype._destroy = function () {
        this.keyboard._destroy();
        this.mouse._destroy();
        this.gamepads._destroy();
    };
    ;
    /**
     * Returns true if a 'left' control was pressed.
     * @returns {boolean}
     */
    Input.prototype.actionMenuLeft = function () {
        return this.keyboard.keyPressed(keyboard_1.Key.Left) || this.keyboard.keyPressed("a")
            || this.gamepads.axisPressed(this.FIRST_PLAYER, gamepads_1.GamepadAxis.LeftStickX) < 0
            || this.gamepads.buttonPressed(this.FIRST_PLAYER, gamepads_1.GamepadButton.DPadLeft);
    };
    ;
    /**
     * Returns true if a 'right' control was pressed.
     * @returns {boolean}
     */
    Input.prototype.actionMenuRight = function () {
        return this.keyboard.keyPressed(keyboard_1.Key.Right) || this.keyboard.keyPressed("d")
            || this.gamepads.axisPressed(this.FIRST_PLAYER, gamepads_1.GamepadAxis.LeftStickX) > 0
            || this.gamepads.buttonPressed(this.FIRST_PLAYER, gamepads_1.GamepadButton.DPadRight);
    };
    ;
    /**
     * Returns true if an 'up' control was pressed.
     * @returns {boolean}
     */
    Input.prototype.actionMenuUp = function () {
        return this.keyboard.keyPressed(keyboard_1.Key.Up) || this.keyboard.keyPressed("w")
            || this.gamepads.axisPressed(this.FIRST_PLAYER, gamepads_1.GamepadAxis.LeftStickY) < 0
            || this.gamepads.buttonPressed(this.FIRST_PLAYER, gamepads_1.GamepadButton.DPadUp);
    };
    ;
    /**
     * Returns true if a 'down' control was pressed.
     * @returns {boolean}
     */
    Input.prototype.actionMenuDown = function () {
        return this.keyboard.keyPressed(keyboard_1.Key.Down) || this.keyboard.keyPressed("s")
            || this.gamepads.axisPressed(this.FIRST_PLAYER, gamepads_1.GamepadAxis.LeftStickY) > 0
            || this.gamepads.buttonPressed(this.FIRST_PLAYER, gamepads_1.GamepadButton.DPadDown);
    };
    ;
    /**
     * Returns true if an 'accept' control was pressed.
     * @returns {boolean}
     */
    Input.prototype.actionMenuAccept = function () {
        return this.keyboard.keyPressed(keyboard_1.Key.Space) || this.keyboard.keyPressed(keyboard_1.Key.Enter)
            || this.gamepads.buttonPressed(this.FIRST_PLAYER, gamepads_1.GamepadButton.A);
    };
    ;
    /**
     * Returns true if a 'cancel' control was pressed.
     * @returns {boolean}
     */
    Input.prototype.actionMenuCancel = function () {
        return this.keyboard.keyPressed(keyboard_1.Key.Escape)
            || this.gamepads.buttonPressed(this.FIRST_PLAYER, gamepads_1.GamepadButton.B);
    };
    ;
    /**
     * Returns true if a 'pause' control was pressed.
     * @returns {boolean}
     */
    Input.prototype.actionGamePause = function () {
        return this.keyboard.keyPressed(keyboard_1.Key.Escape)
            || this.gamepads.buttonPressed(this.FIRST_PLAYER, gamepads_1.GamepadButton.Start);
    };
    ;
    /**
     * Called by the SDK each frame.
     */
    Input.prototype._update = function () {
        this.keyboard._update();
        this.mouse._update();
        this.gamepads._update();
    };
    ;
    return Input;
}());
exports.Input = Input;
;

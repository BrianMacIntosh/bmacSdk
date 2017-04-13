"use strict";
exports.__esModule = true;
var GamepadButton;
(function (GamepadButton) {
    GamepadButton[GamepadButton["A"] = 0] = "A";
    GamepadButton[GamepadButton["B"] = 1] = "B";
    GamepadButton[GamepadButton["X"] = 2] = "X";
    GamepadButton[GamepadButton["Y"] = 3] = "Y";
    GamepadButton[GamepadButton["LeftShoulder"] = 4] = "LeftShoulder";
    GamepadButton[GamepadButton["RightShoulder"] = 5] = "RightShoulder";
    GamepadButton[GamepadButton["LeftTrigger"] = 6] = "LeftTrigger";
    GamepadButton[GamepadButton["RightTrigger"] = 7] = "RightTrigger";
    GamepadButton[GamepadButton["Back"] = 8] = "Back";
    GamepadButton[GamepadButton["Start"] = 9] = "Start";
    GamepadButton[GamepadButton["LeftStick"] = 10] = "LeftStick";
    GamepadButton[GamepadButton["RightStick"] = 11] = "RightStick";
    GamepadButton[GamepadButton["DPadUp"] = 12] = "DPadUp";
    GamepadButton[GamepadButton["DPadDown"] = 13] = "DPadDown";
    GamepadButton[GamepadButton["DPadLeft"] = 14] = "DPadLeft";
    GamepadButton[GamepadButton["DPadRight"] = 15] = "DPadRight";
    GamepadButton[GamepadButton["Home"] = 16] = "Home";
})(GamepadButton = exports.GamepadButton || (exports.GamepadButton = {}));
var GamepadAxis;
(function (GamepadAxis) {
    GamepadAxis[GamepadAxis["LeftStickX"] = 0] = "LeftStickX";
    GamepadAxis[GamepadAxis["LeftStickY"] = 1] = "LeftStickY";
    GamepadAxis[GamepadAxis["RightStickX"] = 2] = "RightStickX";
    GamepadAxis[GamepadAxis["RightStickY"] = 3] = "RightStickY";
})(GamepadAxis = exports.GamepadAxis || (exports.GamepadAxis = {}));
var Gamepads = (function () {
    function Gamepads() {
        /**
         * Read-only. Set if gamepad data was not found.
         * @type {boolean}
         */
        this.isHeadless = false;
        this.STICK_THRESHOLD = 0.5;
        this.DEAD_ZONE = 0.3;
    }
    Gamepads.prototype._init = function () {
    };
    ;
    Gamepads.prototype._update = function () {
        if (typeof navigator !== "undefined" && navigator.getGamepads) {
            //HACK: so much garbage
            this.oldGamepads = this._cloneGamepadState(this.gamepads);
            this.gamepads = this._cloneGamepadState(navigator.getGamepads());
        }
        else {
            this.oldGamepads = undefined;
            this.gamepads = undefined;
            this.isHeadless = true;
        }
    };
    ;
    Gamepads.prototype._destroy = function () {
    };
    ;
    /**
     * Gets raw information for the gamepad at the specified index.
     * @param {number} index Gamepad index.
     */
    Gamepads.prototype.getGamepad = function (index) {
        if (this.gamepads && this.gamepads[index])
            return this.gamepads[index];
        else
            return null;
    };
    ;
    /**
     * Returns true if there is a gamepad at the specified index.
     * @param {number} index Gamepad index.
     * @returns {boolean}
     */
    Gamepads.prototype.gamepadExists = function (index) {
        if (this.gamepads && this.gamepads[index])
            return true;
        else
            return false;
    };
    ;
    /**
     * Returns true if there is a connected gamepad at the specified index.
     * @param {number} index Gamepad index.
     * @returns {boolean}
     */
    Gamepads.prototype.gamepadConnected = function (index) {
        if (this.gamepads && this.gamepads[index] && this.gamepads[index].connected)
            return true;
        else
            return false;
    };
    ;
    /**
     * Returns true on the frame the specified gamepad presses the specified button.
     * @param {number} index Gamepad index.
     * @param {number} button See constant definitions.
     */
    Gamepads.prototype.buttonPressed = function (index, button) {
        return this.buttonDown(index, button) && !this._buttonDownOld(index, button);
    };
    ;
    /**
     * Returns true on the frame the specified gamepad releases the specified button.
     * @param {number} index Gamepad index.
     * @param {number} button See constant definitions.
     */
    Gamepads.prototype.buttonReleased = function (index, button) {
        return this.buttonUp(index, button) && !this._buttonUpOld(index, button);
    };
    ;
    /**
     * Returns true if the specified button on the specified gamepad is not down.
     * @param {number} index Gamepad index.
     * @param {number} button See constant definitions.
     */
    Gamepads.prototype.buttonUp = function (index, button) {
        if (this.gamepads && this.gamepads[index] && this.gamepads[index].buttons.length > button)
            return !this.gamepads[index].buttons[button].pressed;
        else
            return false;
    };
    ;
    /**
     * Returns true if the specified button on the specified gamepad is down.
     * @param {number} index Gamepad index.
     * @param {number} button See constant definitions.
     */
    Gamepads.prototype.buttonDown = function (index, button) {
        if (this.gamepads && this.gamepads[index] && this.gamepads[index].buttons.length > button)
            return this.gamepads[index].buttons[button].pressed;
        else
            return false;
    };
    ;
    Gamepads.prototype._buttonUpOld = function (index, button) {
        if (this.oldGamepads && this.oldGamepads[index] && this.oldGamepads[index].buttons.length > button)
            return !this.oldGamepads[index].buttons[button].pressed;
        else
            return false;
    };
    ;
    Gamepads.prototype._buttonDownOld = function (index, button) {
        if (this.oldGamepads && this.oldGamepads[index] && this.oldGamepads[index].buttons.length > button)
            return this.oldGamepads[index].buttons[button].pressed;
        else
            return false;
    };
    ;
    /**
     * Returns the raw value of the specified gamepad button.
     * @param {number} index Gamepad index.
     * @param {number} button See constant definitions.
     */
    Gamepads.prototype.buttonValue = function (index, button) {
        if (this.gamepads && this.gamepads[index] && this.gamepads[index].buttons.length > button)
            return this.gamepads[index].buttons[button].value;
        else
            return 0;
    };
    ;
    /**
     * Returns the value of the specified gamepad axis.
     * @param {number} index Gamepad index.
     * @param {number} axisIndex See constant definitions.
     */
    Gamepads.prototype.getAxis = function (index, axisIndex) {
        if (this.gamepads && this.gamepads[index] && this.gamepads[index].axes.length > axisIndex) {
            var val = this.gamepads[index].axes[axisIndex];
            if (Math.abs(val) <= this.DEAD_ZONE)
                val = 0;
            return val;
        }
        else
            return 0;
    };
    ;
    Gamepads.prototype._getOldAxis = function (index, axisIndex) {
        if (this.oldGamepads && this.oldGamepads[index] && this.oldGamepads[index].axes.length > axisIndex) {
            var val = this.oldGamepads[index].axes[axisIndex];
            if (Math.abs(val) <= this.DEAD_ZONE)
                val = 0;
            return val;
        }
        else
            return 0;
    };
    ;
    /**
     * Returns 1 or -1 on the first frame the specified axis is pressed in that direction, or 0 if it isn't pressed.
     * @param {number} index Gamepad index.
     * @param {number} axisIndex See constant definitions.
     */
    Gamepads.prototype.axisPressed = function (index, axisIndex) {
        if (this._getOldAxis(index, axisIndex) < this.STICK_THRESHOLD && this.getAxis(index, axisIndex) >= this.STICK_THRESHOLD)
            return 1;
        else if (this._getOldAxis(index, axisIndex) > -this.STICK_THRESHOLD && this.getAxis(index, axisIndex) <= -this.STICK_THRESHOLD)
            return -1;
        else
            return 0;
    };
    ;
    Gamepads.prototype._cloneGamepadState = function (source) {
        if (!source)
            return null;
        var target = [];
        target.length = source.length;
        for (var i = 0; i < source.length; i++) {
            if (source[i]) {
                var gamepad = source[i];
                var state = {};
                state.buttons = [];
                state.buttons.length = gamepad.buttons.length;
                state.axes = [];
                for (var a = 0; a < gamepad.axes.length; a++) {
                    state.axes[a] = gamepad.axes[a];
                }
                for (var b = 0; b < gamepad.buttons.length; b++) {
                    var obj = { pressed: gamepad.buttons[b].pressed, value: gamepad.buttons[b].value };
                    state.buttons[b] = obj;
                }
                target[i] = state;
            }
            else {
                target[i] = null;
            }
        }
        return target;
    };
    ;
    return Gamepads;
}());
exports.Gamepads = Gamepads;

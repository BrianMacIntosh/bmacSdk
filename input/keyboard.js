"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Key;
(function (Key) {
    Key[Key["Left"] = 37] = "Left";
    Key[Key["Up"] = 38] = "Up";
    Key[Key["Right"] = 39] = "Right";
    Key[Key["Down"] = 40] = "Down";
    Key[Key["Space"] = 32] = "Space";
    Key[Key["PageUp"] = 33] = "PageUp";
    Key[Key["PageDown"] = 34] = "PageDown";
    Key[Key["Tab"] = 9] = "Tab";
    Key[Key["Escape"] = 27] = "Escape";
    Key[Key["Enter"] = 13] = "Enter";
    Key[Key["Shift"] = 16] = "Shift";
    Key[Key["Ctrl"] = 17] = "Ctrl";
    Key[Key["Alt"] = 18] = "Alt";
})(Key = exports.Key || (exports.Key = {}));
var Keyboard = (function () {
    function Keyboard() {
        /**
         * Read-only. Set if 'document' was not found.
         * @type {boolean}
         */
        this.isHeadless = false;
        //stores current button state
        this.keysDown = {};
        //buffers button changes for one frame
        this.keysPressed = {};
        this.keysReleased = {};
        this.keysPressedBuffer = {};
        this.keysReleasedBuffer = {};
    }
    /**
     * Called by the SDK to initialize keyboard listening.
     */
    Keyboard.prototype._init = function () {
        if (typeof document !== "undefined") {
            this.boundKeyDown = this._onKeyDown.bind(this);
            this.boundKeyUp = this._onKeyUp.bind(this);
            document.addEventListener("keydown", this.boundKeyDown, false);
            document.addEventListener("keyup", this.boundKeyUp, false);
        }
        else {
            this.isHeadless = true;
        }
    };
    ;
    /**
     * Called by the SDK to stop keyboard listening.
     */
    Keyboard.prototype._destroy = function () {
        if (typeof document !== "undefined") {
            document.removeEventListener("keydown", this.boundKeyDown, false);
            document.removeEventListener("keyup", this.boundKeyUp, false);
        }
    };
    ;
    /**
     * Called each frame by the SDK.
     */
    Keyboard.prototype._update = function () {
        //cycle buffers
        var temp = this.keysPressed;
        this.keysPressed = this.keysPressedBuffer;
        this.keysPressedBuffer = temp;
        var temp = this.keysReleased;
        this.keysReleased = this.keysReleasedBuffer;
        this.keysReleasedBuffer = temp;
        //clear new buffer
        for (var i in this.keysPressedBuffer) {
            this.keysPressedBuffer[i] = false;
        }
        for (var i in this.keysReleasedBuffer) {
            this.keysReleasedBuffer[i] = false;
        }
        //update button down states
        for (var i in this.keysPressed) {
            //ignore repeats
            if (this.keysDown[i])
                this.keysPressed[i] = false;
            else if (this.keysPressed[i] && !this.keysReleased[i])
                this.keysDown[i] = true;
        }
        for (var i in this.keysReleased) {
            //ignore repeats
            if (!this.keysDown[i])
                this.keysReleased[i] = false;
            else if (this.keysReleased[i] && !this.keysPressed[i])
                this.keysDown[i] = false;
        }
    };
    ;
    Keyboard.prototype._onKeyDown = function (e) {
        e = e || window.event;
        this.keysPressedBuffer[e.keyCode] = true;
        // prevent scrolling
        if (e.keyCode == Key.Space || e.keyCode == Key.Tab) {
            e.preventDefault();
            return false;
        }
        else {
            return true;
        }
    };
    ;
    Keyboard.prototype._onKeyUp = function (e) {
        e = e || window.event;
        this.keysReleasedBuffer[e.keyCode] = true;
    };
    ;
    Keyboard.prototype._translateKey = function (code) {
        if (typeof code == 'string') {
            return code.toUpperCase().charCodeAt(0);
        }
        else {
            return code;
        }
    };
    ;
    /**
     * Returns true on the first frame the specified key is pressed.
     * @param {string|Key} code A character or a key scancode (see constant definitions).
     * @returns {boolean}
     */
    Keyboard.prototype.keyPressed = function (code) {
        return !!this.keysPressed[this._translateKey(code)];
    };
    ;
    /**
     * Returns true on the first frame the specified key is released.
     * @param {string|Key} code A character or a key scancode (see constant definitions).
     * @returns {boolean}
     */
    Keyboard.prototype.keyReleased = function (code) {
        return !!this.keysReleased[this._translateKey(code)];
    };
    ;
    /**
     * Returns true if the specified key is down.
     * @param {string|Key} code A character or a key scancode (see constant definitions).
     * @returns {boolean}
     */
    Keyboard.prototype.keyDown = function (code) {
        return !!this.keysDown[this._translateKey(code)];
    };
    ;
    /**
     * Returns true if the specified key is not down.
     * @param {string|Key} code A character or a key scancode (see constant definitions).
     * @returns {boolean}
     */
    Keyboard.prototype.keyUp = function (code) {
        return !this.keysDown[this._translateKey(code)];
    };
    ;
    /**
     * Returns the number key pressed this frame, or -1 if none.
     * @returns {number}
     */
    Keyboard.prototype.getNumberPressed = function () {
        for (var i = 48; i <= 57; i++) {
            if (this.keyPressed(i))
                return i - 48;
        }
        return -1;
    };
    ;
    return Keyboard;
}());
exports.Keyboard = Keyboard;
;

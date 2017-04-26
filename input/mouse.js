"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["Left"] = 1] = "Left";
    MouseButton[MouseButton["Middle"] = 2] = "Middle";
    MouseButton[MouseButton["Right"] = 3] = "Right";
    MouseButton[MouseButton["Other"] = 4] = "Other";
})(MouseButton = exports.MouseButton || (exports.MouseButton = {}));
var Mouse = (function () {
    function Mouse() {
        /**
         * Read-only. Set if 'document' was not found.
         * @type {boolean}
         */
        this.isHeadless = false;
        this.mousePos = { x: 0, y: 0 };
        //stores current button state
        this.mouseDown = {};
        //buffers button changes for one frame
        //duplicated in order to remember the states into the next frame
        this.mousePressed = {};
        this.mouseReleased = {};
        this.mousePressedBuffer = {};
        this.mouseReleasedBuffer = {};
        this.wheelDelta = 0;
        this.wheelDeltaBuffer = 0;
    }
    /**
     * Called by the SDK to start listening to the mouse.
     */
    Mouse.prototype._init = function () {
        if (typeof document !== "undefined") {
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
        else {
            this.isHeadless = true;
        }
    };
    ;
    /**
     * Called by the SDK to stop mouse listening.
     */
    Mouse.prototype._destroy = function () {
        if (typeof document !== "undefined") {
            document.removeEventListener("mousemove", this.boundMouseMove, false);
            document.removeEventListener("dragover", this.boundDragOver, false);
            document.removeEventListener("mousedown", this.boundMouseDown, false);
            document.removeEventListener("mouseup", this.boundMouseUp, false);
            document.removeEventListener("wheel", this.boundMouseWheel, false);
        }
    };
    ;
    /**
     * Called by the SDK each frame to update the input state.
     */
    Mouse.prototype._update = function () {
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
        for (var i in this.mousePressedBuffer) {
            this.mousePressedBuffer[i] = false;
        }
        for (var i in this.mouseReleasedBuffer) {
            this.mouseReleasedBuffer[i] = false;
        }
        //update button down states
        for (var i in this.mousePressed) {
            if (this.mousePressed[i] && !this.mouseReleased[i])
                this.mouseDown[i] = true;
        }
        for (var i in this.mouseReleased) {
            if (this.mouseReleased[i] && !this.mousePressed[i])
                this.mouseDown[i] = false;
        }
    };
    ;
    Mouse.prototype._onMouseMove = function (e) {
        e = e || window.event;
        this.mousePos.x = e.pageX;
        this.mousePos.y = e.pageY;
    };
    ;
    Mouse.prototype._onDragOver = function (e) {
        e = e || window.event;
        this.mousePos.x = e.pageX,
            this.mousePos.y = e.pageY;
    };
    Mouse.prototype._onMouseDown = function (e) {
        e = e || window.event;
        this.mousePressedBuffer[e.which || e.keyCode] = true;
    };
    Mouse.prototype._onMouseUp = function (e) {
        e = e || window.event;
        this.mouseReleasedBuffer[e.which || e.keyCode] = true;
    };
    Mouse.prototype._onMouseWheel = function (e) {
        e = e || window.event;
        this.wheelDeltaBuffer = e.wheelDelta;
    };
    /**
     * Returns the mousewheel delta on this frame.
     * @returns {number}
     */
    Mouse.prototype.getMouseWheelDelta = function () {
        return this.wheelDelta;
    };
    /**
     * Returns the current position of the mouse relative to the specified HTML element.
     * @param {Element} relativeTo
     * @param {THREE.Vector2} buffer Object to fill (optional)
     * @returns {Object}
     */
    Mouse.prototype.getPosition = function (relativeTo, buffer) {
        if (!buffer)
            buffer = new THREE.Vector2();
        if (!relativeTo) {
            buffer.set(this.mousePos.x, this.mousePos.y);
            return buffer;
        }
        //Find global position of element
        var elemX = relativeTo.offsetLeft;
        var elemY = relativeTo.offsetTop;
        while ((relativeTo.offsetParent instanceof HTMLElement)
            && (relativeTo = relativeTo.offsetParent)) {
            elemX += relativeTo.offsetLeft;
            elemY += relativeTo.offsetTop;
        }
        //Calculate relative position of mouse
        buffer.set(this.mousePos.x - elemX, this.mousePos.y - elemY);
        return buffer;
    };
    ;
    /**
     * Returns true on the first frame the specified mouse button is pressed.
     * @param {number} button See constant definitions.
     * @returns {boolean}
     */
    Mouse.prototype.buttonPressed = function (button) {
        return !!this.mousePressed[button];
    };
    ;
    /**
     * Returns true on the first frame the specified mouse button is released.
     * @param {number} button See constant definitions.
     * @returns {boolean}
     */
    Mouse.prototype.buttonReleased = function (button) {
        return !!this.mouseReleased[button];
    };
    ;
    /**
     * Returns true if the specified mouse button is down.
     * @param {number} button See constant definitions.
     * @returns {boolean}
     */
    Mouse.prototype.buttonDown = function (button) {
        return !!this.mouseDown[button];
    };
    ;
    /**
     * Returns true if the specified mouse button is not down.
     * @param {number} button See constant definitions.
     * @returns {boolean}
     */
    Mouse.prototype.buttonUp = function (button) {
        return !this.mouseDown[button];
    };
    ;
    return Mouse;
}());
exports.Mouse = Mouse;
;

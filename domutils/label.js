"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Label = (function () {
    function Label(cssClass, parent, camera, renderer) {
        this.parent = parent;
        this.camera = camera;
        this.renderer = renderer;
        this.tempProjectionVector = new THREE.Vector3();
        this.element = document.createElement("div");
        this.element.className = cssClass;
        parent.appendChild(this.element);
    }
    /**
     * Clears this label's settings.
     */
    Label.prototype.free = function () {
        this.tiedTo = undefined;
        this.setColor(undefined);
        this.set("", 0, 0);
        this.hide();
    };
    /**
     * Ties the label's position to that of the specified object.
     */
    Label.prototype.tieTo = function (object, offset) {
        this.tiedTo = object;
        this.tieOffset = offset;
    };
    Label.prototype.show = function () {
        if (!this.visibility) {
            this.visibility = true;
            this.element.style.visibility = "visible";
        }
    };
    Label.prototype.hide = function () {
        if (this.visibility) {
            this.visibility = false;
            this.element.style.visibility = "hidden";
        }
    };
    /**
     * Manually set this label's position.
     */
    Label.prototype.setPosition = function (position) {
        this.tiedTo = undefined;
        this.setPositionHelper(position);
    };
    Label.prototype.setPositionHelper = function (position) {
        var unprojected = this.tempProjectionVector.addVectors(position, this.tieOffset).project(this.camera);
        unprojected.x = (unprojected.x / 2 + 0.5) * this.parent.offsetWidth;
        unprojected.y = (-unprojected.y / 2 + 0.5) * this.parent.offsetHeight;
        // align
        unprojected.x -= (this.alignx + 0.5) * this.element.offsetWidth;
        unprojected.y -= (this.aligny + 0.5) * this.element.offsetHeight;
        this.element.style.left = Math.round(unprojected.x) + "px";
        this.element.style.top = Math.round(unprojected.y) + "px";
    };
    /**
     * @param {number} align -0.5:left, 0:center, 0.5:right
     */
    Label.prototype.set = function (text, alignx, aligny) {
        this.alignx = alignx;
        this.aligny = aligny;
        this.element.innerHTML = text;
        this.show();
    };
    /**
     *
     * @param color Can be in any HTML/CSS form.
     */
    Label.prototype.setColor = function (color) {
        this.color = color;
        this.element.style.color = color;
    };
    Label.prototype.update = function (deltaSec) {
        if (this.tiedTo) {
            this.setPositionHelper(this.tiedTo.position);
        }
    };
    return Label;
}());
exports.Label = Label;

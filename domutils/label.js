"use strict";
var threeutils_1 = require("../threeutils");
var Label = (function () {
    function Label(cssClass, parent, camera, renderer) {
        this.parent = parent;
        this.camera = camera;
        this.renderer = renderer;
        this.element = document.createElement("div");
        this.element.className = cssClass;
        parent.appendChild(this.element);
    }
    /**
     * Clears this label's settings.
     */
    Label.prototype.free = function () {
        this.tiedTo = undefined;
        this.set("", 1, 1);
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
        var unprojected = threeutils_1.ThreeUtils.newVector3().addVectors(position, this.tieOffset).project(this.camera);
        unprojected.x = (unprojected.x / 2 + 0.5) * this.parent.offsetWidth;
        unprojected.y = (-unprojected.y / 2 + 0.5) * this.parent.offsetHeight;
        // align
        switch (this.alignx) {
            case 0: break;
            case 1:
                unprojected.x -= this.element.offsetWidth / 2;
                break;
            case 2:
                unprojected.x -= this.element.offsetWidth;
                break;
        }
        switch (this.aligny) {
            case 0: break;
            case 1:
                unprojected.y -= this.element.offsetHeight / 2;
                break;
            case 2:
                unprojected.y -= this.element.offsetHeight;
                break;
        }
        this.element.style.left = Math.round(unprojected.x) + "px";
        this.element.style.top = Math.round(unprojected.y) + "px";
        threeutils_1.ThreeUtils.releaseVector3(unprojected);
    };
    /**
     * @param {number} align 0:left, 1:center, 2:right
     */
    Label.prototype.set = function (text, alignx, aligny) {
        this.alignx = alignx;
        this.aligny = aligny;
        this.element.innerHTML = text;
        this.show();
    };
    Label.prototype.update = function (deltaSec) {
        if (this.tiedTo) {
            this.setPositionHelper(this.tiedTo.position);
        }
    };
    return Label;
}());
exports.Label = Label;

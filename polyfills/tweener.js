"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BaseTweener = (function () {
    function BaseTweener(duration) {
        this.duration = duration;
        this.timer = 0;
        this.timer = duration;
    }
    /**
     * Updates the timer. Returns true if it was changed.
     */
    BaseTweener.prototype.update = function (deltaSec) {
        if (this.timer < this.duration) {
            this.timer = Math.min(this.duration, this.timer + deltaSec);
            return true;
        }
        else {
            return false;
        }
    };
    BaseTweener.prototype.isActive = function () {
        return this.timer < this.duration;
    };
    return BaseTweener;
}());
var Tweener = (function (_super) {
    __extends(Tweener, _super);
    function Tweener(duration) {
        var _this = _super.call(this, duration) || this;
        _this.from = 0;
        _this.to = 0;
        return _this;
    }
    Tweener.prototype.start = function (from, to, func) {
        this.from = from;
        this.to = to;
        this.timer = 0;
        this.func = func;
    };
    Tweener.prototype.getRatio = function () {
        return Math.clamp(this.timer / this.duration, 0, 1);
    };
    Tweener.prototype.sample = function () {
        return this.func(this.timer, this.from, this.getDelta(), this.duration);
    };
    Tweener.prototype.retarget = function (to) {
        this.to = to;
    };
    Tweener.prototype.getDelta = function () {
        return this.to - this.from;
    };
    return Tweener;
}(BaseTweener));
exports.Tweener = Tweener;
var Vector2Tweener = (function (_super) {
    __extends(Vector2Tweener, _super);
    function Vector2Tweener(duration) {
        var _this = _super.call(this, duration) || this;
        _this.from = new THREE.Vector2();
        _this.to = new THREE.Vector2();
        return _this;
    }
    Vector2Tweener.prototype.start = function (from, to, func) {
        this.from.copy(from);
        this.to.copy(to);
        this.timer = 0;
        this.func = func;
    };
    Vector2Tweener.prototype.sample = function (buffer) {
        buffer.x = this.func(this.timer, this.from.x, this.getDeltaX(), this.duration);
        buffer.y = this.func(this.timer, this.from.y, this.getDeltaY(), this.duration);
        return buffer;
    };
    Vector2Tweener.prototype.retarget = function (to) {
        this.to.copy(to);
    };
    Vector2Tweener.prototype.getDelta = function (vector) {
        return vector.subVectors(this.to, this.from);
    };
    Vector2Tweener.prototype.getDeltaX = function () {
        return this.to.x - this.from.x;
    };
    Vector2Tweener.prototype.getDeltaY = function () {
        return this.to.y - this.from.y;
    };
    return Vector2Tweener;
}(BaseTweener));
exports.Vector2Tweener = Vector2Tweener;

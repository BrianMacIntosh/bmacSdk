"use strict";
exports.__esModule = true;
require("../typings");
require("../polyfills");
var input_1 = require("../input");
var engine_1 = require("./engine");
var audiomanager_1 = require("../audiomanager");
var engine_2 = require("./engine");
exports.EngineObject = engine_2.EngineObject;
exports.Engine = engine_2.Engine;
var noise_1 = require("../thirdparty/noise");
exports.noise = noise_1.noise;
/**
 * @namespace
 */
var bmacSdk = (function () {
    function bmacSdk() {
        /**
         * If set, the game will not update if the window doesn't have focus.
         * @type {boolean}
         */
        this.CFG_PAUSE_WHEN_UNFOCUSED = false;
        /**
         * If set, the game will update each frame until the specified time has passed (ms).
         */
        this.fastSimulate = undefined;
        /**
         * If set, the game will use a fixed update rate for the engine (in seconds).
         */
        this.fixedUpdateInterval = undefined;
        /**
         * Used to ignore large frame delta after focusin
         * @type {boolean}
         */
        this._eatFrame = false;
        /**
         * Read-only. Set if window or document was not found.
         * @type {boolean}
         */
        this.isHeadless = false;
        /**
         * Set to true if the window has focus.
         * @type {boolean}
         */
        this.isFocused = true;
        this.domAttached = false;
        /**
         * Multiplier to apply to the delta time. Higher values make the game move faster.
         * @type {number}
         */
        this.timeScale = 1;
        this._deltaSec = 0;
        /**
         * The time of the last frame.
         * @type {number}
         */
        this._lastFrame = 0;
        /**
         * List of all active Engines.
         * @type {Engine[]}
         */
        this.engines = [];
        this.input = new input_1.Input();
        this.boundAnimate = this._animate.bind(this);
        bmacSdk.instance = this;
    }
    /**
     * Gets the elapsed time since the last frame (in seconds).
     * @type {number}
     */
    bmacSdk.prototype.getDeltaSec = function () {
        return this._deltaSec * this.timeScale;
    };
    ;
    bmacSdk.prototype.createEngine = function (param) {
        var engine = new engine_1.Engine(this, param);
        this.engines.push(engine);
        if (this.domAttached)
            engine._attachDom();
        return engine;
    };
    /**
     * Call this once to initialize the SDK.
     */
    bmacSdk.prototype.initialize = function () {
        this.isHeadless = typeof window == "undefined" || typeof document == "undefined";
        if (!this.isHeadless) {
            var self = this;
            if (document.readyState !== "loading") {
                this._attachDom();
            }
            else {
                window.addEventListener("load", this._attachDom.bind(this));
            }
            window.addEventListener("blur", function () {
                self.isFocused = false;
            });
            window.addEventListener("focus", function () {
                self.isFocused = true;
                self._eatFrame = true;
            });
            window.addEventListener("resize", function () {
                if (self.domAttached) {
                    for (var c = 0; c < self.engines.length; c++) {
                        self.engines[c]._handleWindowResize();
                    }
                }
            });
        }
    };
    ;
    /**
     * Call this from onload of the body element. Initializes all engines.
     */
    bmacSdk.prototype._attachDom = function () {
        if (this.domAttached)
            return;
        console.log("bmacSdk: DOM attached");
        this.domAttached = true;
        for (var c = 0; c < this.engines.length; c++) {
            this.engines[c]._attachDom();
        }
        this.input._init();
        this._lastFrame = Date.now();
        this._animate();
    };
    ;
    /**
     * Shut down the SDK.
     */
    bmacSdk.prototype.destroy = function () {
        this.input._destroy();
        //TODO: destroy all engines
        //TODO: stop the animate loop
    };
    ;
    /**
     * Main update loop.
     */
    bmacSdk.prototype._animate = function () {
        var simStart = Date.now();
        do {
            if (this.fixedUpdateInterval !== undefined) {
                this._deltaSec = this.fixedUpdateInterval;
            }
            else {
                this._deltaSec = (Date.now() - this._lastFrame) / 1000;
            }
            this._lastFrame = Date.now();
            if (this._eatFrame) {
                this._eatFrame = false;
                break;
            }
            if (this.CFG_PAUSE_WHEN_UNFOCUSED && !this.isFocused) {
                break;
            }
            audiomanager_1.AudioManager._update(this._deltaSec);
            this.input._update();
            for (var c = 0; c < this.engines.length; c++) {
                this.engines[c]._animate(this.getDeltaSec());
            }
        } while (this.fastSimulate !== undefined && (Date.now() - simStart) < this.fastSimulate);
        // node server doesn't have this method and needs to call this manually each frame
        if (!this.isHeadless) {
            requestAnimationFrame(this.boundAnimate);
        }
    };
    ;
    return bmacSdk;
}());
exports.bmacSdk = bmacSdk;
;

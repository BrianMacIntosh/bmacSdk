"use strict";
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
var bmacSdk;
(function (bmacSdk) {
    /**
     * If set, the game will not update if the window doesn't have focus.
     * @type {boolean}
     */
    var CFG_PAUSE_WHEN_UNFOCUSED = false;
    /**
     * If set, the game with update as often as possible.
     */
    bmacSdk.uncappedFramerate = false;
    /**
     * If set, the game will use a fixed update rate for the engine (in seconds).
     */
    bmacSdk.fixedUpdateInterval = undefined;
    /**
     * Used to ignore large frame delta after focusin
     * @type {boolean}
     */
    var _eatFrame = false;
    /**
     * Read-only. Set if window or document was not found.
     * @type {boolean}
     */
    bmacSdk.isHeadless = false;
    /**
     * Set to true if the window has focus.
     * @type {boolean}
     */
    bmacSdk.isFocused = true;
    bmacSdk.domAttached = false;
    /**
     * Multiplier to apply to the delta time. Higher values make the game move faster.
     * @type {number}
     */
    bmacSdk.timeScale = 1;
    /**
     * Gets the elapsed time since the last frame (in seconds).
     * @type {number}
     */
    function getDeltaSec() {
        return _deltaSec * bmacSdk.timeScale;
    }
    bmacSdk.getDeltaSec = getDeltaSec;
    ;
    var _deltaSec = 0;
    /**
     * The time of the last frame.
     * @type {number}
     */
    var _lastFrame = 0;
    /**
     * List of all active Engines.
     * @type {Engine[]}
     */
    var engines = [];
    function createEngine(canvasDivName) {
        var engine = new engine_1.Engine(canvasDivName);
        engines.push(engine);
        if (bmacSdk.domAttached)
            engine._attachDom();
        return engine;
    }
    bmacSdk.createEngine = createEngine;
    /**
     * Call this once to initialize the SDK.
     */
    function initialize() {
        bmacSdk.isHeadless = typeof window == "undefined" || typeof document == "undefined";
        if (!bmacSdk.isHeadless) {
            if (document.readyState !== "loading") {
                _attachDom();
            }
            else {
                window.onload = document.onload = function (ev) { _attachDom(); };
            }
            window.addEventListener("blur", function () {
                bmacSdk.isFocused = false;
            });
            window.addEventListener("focus", function () {
                bmacSdk.isFocused = true;
                _eatFrame = true;
            });
            window.addEventListener("resize", function () {
                if (bmacSdk.domAttached) {
                    for (var c = 0; c < engines.length; c++) {
                        engines[c]._handleWindowResize();
                    }
                }
            });
        }
    }
    bmacSdk.initialize = initialize;
    ;
    /**
     * Call this from onload of the body element. Initializes all engines.
     */
    function _attachDom() {
        if (bmacSdk.domAttached)
            return;
        console.log("bmacSdk: DOM attached");
        bmacSdk.domAttached = true;
        for (var c = 0; c < engines.length; c++) {
            engines[c]._attachDom();
        }
        input_1.Input._init();
        _lastFrame = Date.now();
        _animate();
    }
    bmacSdk._attachDom = _attachDom;
    ;
    /**
     * Shut down the SDK.
     */
    function destroy() {
        input_1.Input._destroy();
        //TODO: destroy all engines
        //TODO: stop the animate loop
    }
    bmacSdk.destroy = destroy;
    ;
    /**
     * Main update loop.
     */
    function _animate() {
        if (bmacSdk.fixedUpdateInterval !== undefined) {
            _deltaSec = bmacSdk.fixedUpdateInterval;
        }
        else {
            _deltaSec = (Date.now() - _lastFrame) / 1000;
        }
        _lastFrame = Date.now();
        // node server doesn't have this method and needs to call this manually each frame
        if (!bmacSdk.isHeadless && !bmacSdk.uncappedFramerate) {
            requestAnimationFrame(_animate);
        }
        if (_eatFrame) {
            _eatFrame = false;
            return;
        }
        if (CFG_PAUSE_WHEN_UNFOCUSED && !bmacSdk.isFocused) {
            return;
        }
        audiomanager_1.AudioManager._update(_deltaSec);
        input_1.Input._update();
        for (var c = 0; c < engines.length; c++) {
            engines[c]._animate();
        }
        if (bmacSdk.uncappedFramerate) {
            setTimeout(_animate, 1);
        }
    }
    bmacSdk._animate = _animate;
    ;
})(bmacSdk = exports.bmacSdk || (exports.bmacSdk = {}));
;

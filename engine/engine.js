"use strict";
var THREE = require("three");
var _1 = require("./");
var input_1 = require("../input");
var threeutils_1 = require("../threeutils");
var domutils_1 = require("../domutils");
var threex_rendererstats_1 = require("../thirdparty/threex.rendererstats");
//TODO: engine should set up Box2D world and listeners for you
var EngineObject = (function () {
    function EngineObject() {
    }
    ;
    EngineObject.prototype.added = function () { };
    ;
    EngineObject.prototype.removed = function () { };
    ;
    EngineObject.prototype.update = function (deltaSec) { };
    ;
    return EngineObject;
}());
exports.EngineObject = EngineObject;
;
/**
 * An Engine has a scene and a camera and manages game objects that are added to it.
 * @param {string} canvasDivName The name of the HTML element the canvas should be added to.
 */
var Engine = (function () {
    function Engine(canvasDivName) {
        this.debugRenderer = true;
        this.objects = [];
        this.scene = new THREE.Scene();
        this.cameraZoom = 1;
        this.canvasDivName = canvasDivName;
        this.mainCamera = new THREE.OrthographicCamera(0, 0, 0, 0, 1, 100);
        this.cameraShaker = new threeutils_1.Shaker();
        this.scene.add(this.cameraShaker.transform);
        this.mainCamera.position.set(0, 0, 0);
        this.cameraShaker.transform.add(this.mainCamera);
    }
    ;
    /**
     * Adds an object to the engine.
     * If the object has an 'added' method, it will be called now or when the DOM is attached.
     * If the object has an 'update' method, it will be called every frame until the object is removed.
     * @param {Object} object
     */
    Engine.prototype.addObject = function (object) {
        object.owner = this;
        if (this.objects.contains(object))
            return object;
        if (object.added && _1.bmacSdk.domAttached)
            object.added();
        this.objects.push(object);
        return object;
    };
    ;
    /**
     * Removes an object from the engine.
     * If the object has a 'removed' method, it will be called.
     * @param {Object} object
     */
    Engine.prototype.removeObject = function (object) {
        if (object.removed)
            object.removed();
        this.objects.remove(object);
    };
    ;
    /**
     * Sets the zoom level of the main camera.
     */
    Engine.prototype.setCameraZoom = function (factor) {
        this.cameraZoom = Math.clamp(factor, 0.1, 100);
        this._updateCameraSize();
    };
    /**
     * Initializes the engine.
     */
    Engine.prototype._attachDom = function () {
        if (!_1.bmacSdk.isHeadless) {
            this.canvasDiv = document.getElementById(this.canvasDivName);
            this.renderer = new THREE.WebGLRenderer();
            this.canvasDiv.appendChild(this.renderer.domElement);
            this.canvasDiv.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; });
            this.renderer.setClearColor(0x000000, 1);
            if (this.debugRenderer) {
                // init renderstats
                this.rendererStats = threex_rendererstats_1.THREEX.RendererStats();
                this.rendererStats.domElement.style.position = 'absolute';
                this.rendererStats.domElement.style.left = '0px';
                this.rendererStats.domElement.style.bottom = '0px';
                document.body.appendChild(this.rendererStats.domElement);
            }
            domutils_1.DomUtils.init(this.canvasDiv, this.mainCamera, this.renderer);
        }
        //TODO: 2D depth management
        this._handleWindowResize();
        for (var c = 0; c < this.objects.length; c++) {
            if (this.objects[c].added) {
                this.objects[c].added();
            }
        }
    };
    ;
    /**
     * Resizes the renderer to match the size of the window.
     */
    Engine.prototype._handleWindowResize = function () {
        if (this.canvasDiv) {
            this.screenWidth = this.canvasDiv.offsetWidth;
            this.screenHeight = this.canvasDiv.offsetHeight;
            this.renderer.setSize(this.screenWidth, this.screenHeight);
        }
        this._updateCameraSize();
    };
    ;
    Engine.prototype._updateCameraSize = function () {
        this.mainCamera.left = (-this.screenWidth / 2) / this.cameraZoom;
        this.mainCamera.right = (this.screenWidth / 2) / this.cameraZoom;
        this.mainCamera.top = (-this.screenHeight / 2) / this.cameraZoom;
        this.mainCamera.bottom = (this.screenHeight / 2) / this.cameraZoom;
        this.mainCamera.updateProjectionMatrix();
    };
    Engine.prototype._animate = function () {
        // calculate mouse pos
        //TODO: use matrices instead
        this.mousePosRel = input_1.Mouse.getPosition(this.canvasDiv, this.mousePosRel);
        if (!this.mousePosWorld)
            this.mousePosWorld = threeutils_1.ThreeUtils.newVector2();
        this.mousePosWorld.set(this.mousePosRel.x + this.mainCamera.position.x, this.mousePosRel.y + this.mainCamera.position.y);
        // update objects
        for (var c = 0; c < this.objects.length; c++) {
            if (this.objects[c].update) {
                this.objects[c].update(_1.bmacSdk.getDeltaSec());
            }
        }
        this.cameraShaker.update(_1.bmacSdk.getDeltaSec());
        domutils_1.DomUtils.update(_1.bmacSdk.getDeltaSec());
        // render
        if (this.renderer) {
            this.renderer.render(this.scene, this.mainCamera);
            if (this.rendererStats)
                this.rendererStats.update(this.renderer);
        }
    };
    ;
    return Engine;
}());
exports.Engine = Engine;
;

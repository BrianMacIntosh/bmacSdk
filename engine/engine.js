"use strict";
exports.__esModule = true;
var THREE = require("three");
require("../typings");
require("../polyfills");
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
    EngineObject.prototype.preRender = function () { };
    ;
    EngineObject.prototype.postRender = function () { };
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
    /**
     *
     * @param param The name of the element to create the canvas under, or an existing Engine to share with.
     */
    function Engine(bmacSdk, param) {
        this.bmacSdk = bmacSdk;
        this.debugRenderer = true;
        this.objects = [];
        this.scene = new THREE.Scene();
        this.cameraZoom = 1;
        this.projectionMatrixInverse = new THREE.Matrix4();
        this.postRenderCallbacks = [];
        if (param instanceof Engine) {
            this.shareContextWith = param;
        }
        else {
            this.canvasDivName = param;
        }
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
        if (object.added && this.bmacSdk.domAttached)
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
    Engine.prototype.subscribePostRender = function (callback) {
        this.postRenderCallbacks.push(callback);
    };
    Engine.prototype.unsubscribePostRender = function (callback) {
        this.postRenderCallbacks.remove(callback);
    };
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
        if (!this.bmacSdk.isHeadless && this.canvasDivName) {
            this.canvasDiv = document.getElementById(this.canvasDivName);
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.autoClearColor = false;
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
            //HACK: labels won't work in shared contexts
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
        var master = this.getContextMaster();
        if (master.canvasDiv) {
            this.screenWidth = master.canvasDiv.offsetWidth;
            this.screenHeight = master.canvasDiv.offsetHeight;
        }
        if (this.renderer) {
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
    Engine.prototype._callPreRender = function () {
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i].preRender) {
                this.objects[i].preRender();
            }
        }
    };
    Engine.prototype._callPostRender = function () {
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i].postRender) {
                this.objects[i].postRender();
            }
        }
        for (var i = this.postRenderCallbacks.length - 1; i >= 0; i--) {
            //NOTE: will not work right if callback removes an earlier one
            this.postRenderCallbacks[i]();
        }
    };
    Engine.prototype.getContextMaster = function () {
        if (this.shareContextWith)
            return this.shareContextWith.getContextMaster();
        else
            return this;
    };
    Engine.prototype._animate = function (deltaSec) {
        var master = this.getContextMaster();
        // calculate mouse pos
        this.mousePosRel = this.bmacSdk.input.mouse.getPosition(master.canvasDiv, this.mousePosRel);
        if (!this.mousePosWorld)
            this.mousePosWorld = threeutils_1.ThreeUtils.newVector3();
        this.mousePosWorld.set(this.mousePosRel.x / (this.screenWidth / 2) - 1, 1 - this.mousePosRel.y / (this.screenHeight / 2), 0);
        this.mousePosWorld.applyMatrix4(this.projectionMatrixInverse.getInverse(this.mainCamera.projectionMatrix));
        this.mousePosWorld.applyMatrix4(this.mainCamera.matrixWorld);
        // update objects
        for (var c = 0; c < this.objects.length; c++) {
            if (this.objects[c].update) {
                this.objects[c].update(deltaSec);
            }
        }
        this.cameraShaker.update(deltaSec);
        domutils_1.DomUtils.update(deltaSec);
        // render
        this._callPreRender();
        if (master.renderer) {
            if (!this.shareContextWith)
                master.renderer.clearColor();
            master.renderer.render(this.scene, this.mainCamera);
            //HACK: doesn't support sharing well
            if (master == this && master.rendererStats) {
                master.rendererStats.update(master.renderer);
            }
        }
        else if (this.scene.autoUpdate) {
            this.scene.updateMatrixWorld(false); //TODO: force param?
        }
        this._callPostRender();
    };
    ;
    return Engine;
}());
exports.Engine = Engine;
;

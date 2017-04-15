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
exports.__esModule = true;
var THREE = require("three");
require("../typings");
/**
 * An object that manages drawing debug shapes for bodies in a Box2D world.
 * @namespace
 */
var ThreeJsDebugDraw = (function (_super) {
    __extends(ThreeJsDebugDraw, _super);
    function ThreeJsDebugDraw(manager) {
        var _this = _super.call(this) || this;
        _this.manager = manager;
        // nested array, indexed by vert count
        _this.meshPools = {};
        _this.poolIndices = {};
        _this.drawFlags = 0;
        return _this;
    }
    ThreeJsDebugDraw.prototype.getGeometry = function (color, vertCount) {
        if (!this.meshPools[vertCount]) {
            this.meshPools[vertCount] = [];
            this.poolIndices[vertCount] = 0;
        }
        var pool = this.meshPools[vertCount];
        var mesh;
        var geometry;
        var index = this.poolIndices[vertCount]++;
        if (!pool[index]) {
            geometry = new THREE.Geometry();
            for (var i = 0; i < vertCount; i++) {
                geometry.vertices.push(new THREE.Vector3());
            }
            var lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
            mesh = new THREE.Line(geometry, lineMaterial);
            pool[index] = mesh;
            this.add(mesh);
        }
        else {
            mesh = pool[index];
            var material = pool[index].material;
            material.color.setHex(color.color);
            geometry = pool[index].geometry;
        }
        mesh.visible = true;
        return geometry;
    };
    ;
    ThreeJsDebugDraw.prototype.startDrawing = function () {
        // reset mesh counters
        for (var i in this.meshPools) {
            this.poolIndices[i] = 0;
        }
    };
    ;
    ThreeJsDebugDraw.prototype.finishDrawing = function () {
        // hide excess meshPools
        for (var i in this.meshPools) {
            for (; this.poolIndices[i] < this.meshPools[i].length; this.poolIndices[i]++) {
                this.meshPools[i][this.poolIndices[i]].visible = false;
            }
        }
    };
    ;
    ThreeJsDebugDraw.prototype.Box2DToThree = function (point) {
        point.applyMatrix4(this.manager.Box2DToGame);
        point.z = 0;
        return point;
    };
    ThreeJsDebugDraw.prototype.SetFlags = function (flags) {
        if (flags === undefined)
            flags = 0;
        this.drawFlags = flags;
    };
    ;
    ThreeJsDebugDraw.prototype.GetFlags = function () {
        return this.drawFlags;
    };
    ;
    ThreeJsDebugDraw.prototype.AppendFlags = function (flags) {
        if (flags === undefined)
            flags = 0;
        this.drawFlags |= flags;
    };
    ;
    ThreeJsDebugDraw.prototype.ClearFlags = function (flags) {
        if (flags === undefined)
            flags = 0;
        this.drawFlags &= ~flags;
    };
    ;
    ThreeJsDebugDraw.prototype.DrawSegment = function (vert1, vert2, color) {
        var geometry = this.getGeometry(color, 2);
        geometry.vertices[0].set(vert1.x, vert1.y, 0);
        this.Box2DToThree(geometry.vertices[0]);
        geometry.vertices[1].set(vert2.x, vert2.y, 0);
        this.Box2DToThree(geometry.vertices[1]);
        geometry.verticesNeedUpdate = true;
        geometry.computeBoundingSphere();
    };
    ;
    ThreeJsDebugDraw.prototype.DrawPolygon = function (vertices, vertexCount, color) {
        var geometry = this.getGeometry(color, vertexCount + 1);
        for (var i = 0; i < vertexCount; i++) {
            geometry.vertices[i].set(vertices[i].x, vertices[i].y, 0);
            this.Box2DToThree(geometry.vertices[i]);
        }
        // close by drawing the first vert again
        geometry.vertices[i].set(vertices[0].x, vertices[0].y, 0);
        this.Box2DToThree(geometry.vertices[i]);
        geometry.verticesNeedUpdate = true;
        geometry.computeBoundingSphere();
    };
    ;
    ThreeJsDebugDraw.prototype.DrawSolidPolygon = function (vertices, vertexCount, color) {
        //TODO:
        this.DrawPolygon(vertices, vertexCount, color);
    };
    ;
    ThreeJsDebugDraw.prototype.DrawCircle = function (center, radius, color) {
        var circleRes = 16;
        var geometry = this.getGeometry(color, circleRes + 1);
        for (var i = 0; i < circleRes; i++) {
            var angle = i * Math.PI * 2 / circleRes;
            var x = Math.cos(angle) * radius + center.x;
            var y = Math.sin(angle) * radius + center.y;
            geometry.vertices[i].set(x, y, 0);
            this.Box2DToThree(geometry.vertices[i]);
        }
        // close by drawing the first vert again
        var x = Math.cos(0) * radius + center.x;
        var y = Math.sin(0) * radius + center.y;
        geometry.vertices[i].set(x, y, 0);
        this.Box2DToThree(geometry.vertices[i]);
        geometry.verticesNeedUpdate = true;
        geometry.computeBoundingSphere();
    };
    ;
    ThreeJsDebugDraw.prototype.DrawSolidCircle = function (center, radius, axis, color) {
        //TODO:
        this.DrawCircle(center, radius, color);
    };
    ;
    ThreeJsDebugDraw.prototype.DrawTransform = function (transform) {
        //TODO:
    };
    ;
    /**
    * Get the alpha value used for lines.
    * @return Alpha value used for drawing lines.
    **/
    ThreeJsDebugDraw.prototype.GetAlpha = function () {
        //TODO:
        return 1;
    };
    /**
    * Get the draw scale.
    * @return Draw scale ratio.
    **/
    ThreeJsDebugDraw.prototype.GetDrawScale = function () {
        //TODO:
        return 1;
    };
    /**
    * Get the alpha value used for fills.
    * @return Alpha value used for drawing fills.
    **/
    ThreeJsDebugDraw.prototype.GetFillAlpha = function () {
        //TODO:
        return 0;
    };
    /**
    * Get the line thickness.
    * @return Line thickness.
    **/
    ThreeJsDebugDraw.prototype.GetLineThickness = function () {
        //TODO:
        return 1;
    };
    /**
    * Get the HTML Canvas Element for drawing.
    * @note box2dflash uses Sprite object, box2dweb uses CanvasRenderingContext2D, that is why this function is called GetSprite().
    * @return The HTML Canvas Element used for debug drawing.
    **/
    ThreeJsDebugDraw.prototype.GetSprite = function () {
        //TODO:
        return undefined;
    };
    /**
    * Get the scale used for drawing XForms.
    * @return Scale for drawing transforms.
    **/
    ThreeJsDebugDraw.prototype.GetXFormScale = function () {
        //TODO:
        return 1;
    };
    /**
    * Set the alpha value used for lines.
    * @param alpha Alpha value for drawing lines.
    **/
    ThreeJsDebugDraw.prototype.SetAlpha = function (alpha) {
        //TODO:
    };
    /**
    * Set the draw scale.
    * @param drawScale Draw scale ratio.
    **/
    ThreeJsDebugDraw.prototype.SetDrawScale = function (drawScale) {
        //TODO:
    };
    /**
    * Set the alpha value used for fills.
    * @param alpha Alpha value for drawing fills.
    **/
    ThreeJsDebugDraw.prototype.SetFillAlpha = function (alpha) {
        //TODO:
    };
    /**
    * Set the line thickness.
    * @param lineThickness The new line thickness.
    **/
    ThreeJsDebugDraw.prototype.SetLineThickness = function (lineThickness) {
        //TODO:
    };
    /**
    * Set the HTML Canvas Element for drawing.
    * @note box2dflash uses Sprite object, box2dweb uses CanvasRenderingContext2D, that is why this function is called SetSprite().
    * @param canvas HTML Canvas Element to draw debug information to.
    **/
    ThreeJsDebugDraw.prototype.SetSprite = function (canvas) {
        //TODO:
    };
    /**
    * Set the scale used for drawing XForms.
    * @param xformScale The transform scale.
    **/
    ThreeJsDebugDraw.prototype.SetXFormScale = function (xformScale) {
        //TODO:
    };
    return ThreeJsDebugDraw;
}(THREE.Object3D));
exports.ThreeJsDebugDraw = ThreeJsDebugDraw;

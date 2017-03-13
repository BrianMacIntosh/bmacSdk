"use strict";
exports.__esModule = true;
var THREE = require("three");
require("../typings");
var b2utils_1 = require("../b2utils");
/**
 * An object that manages drawing debug shapes for bodies in a Box2D world.
 * @namespace
 */
var ThreeJsDebugDraw = (function () {
    function ThreeJsDebugDraw() {
        // nested array, indexed by vert count
        this.meshPools = {};
        this.poolIndices = {};
        this.drawFlags = 0;
        this.transform = new THREE.Object3D();
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
            this.transform.add(mesh);
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
        var x1 = vert1.x * b2utils_1.b2Utils.B2_SCALE;
        var y1 = vert1.y * b2utils_1.b2Utils.B2_SCALE;
        var x2 = vert2.x * b2utils_1.b2Utils.B2_SCALE;
        var y2 = vert2.y * b2utils_1.b2Utils.B2_SCALE;
        geometry.vertices[0].set(x1, y1, 0);
        geometry.vertices[1].set(x2, y2, 0);
        geometry.verticesNeedUpdate = true;
        geometry.computeBoundingSphere();
    };
    ;
    ThreeJsDebugDraw.prototype.DrawPolygon = function (vertices, vertexCount, color) {
        var geometry = this.getGeometry(color, vertexCount + 1);
        for (var i = 0; i < vertexCount; i++) {
            var x = vertices[i].x * b2utils_1.b2Utils.B2_SCALE;
            var y = vertices[i].y * b2utils_1.b2Utils.B2_SCALE;
            geometry.vertices[i].set(x, y, 0);
        }
        // close by drawing the first vert again
        var x = vertices[0].x * b2utils_1.b2Utils.B2_SCALE;
        var y = vertices[0].y * b2utils_1.b2Utils.B2_SCALE;
        geometry.vertices[i].set(x, y, 0);
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
        var cx = center.x * b2utils_1.b2Utils.B2_SCALE;
        var cy = center.y * b2utils_1.b2Utils.B2_SCALE;
        for (var i = 0; i < circleRes; i++) {
            var angle = i * Math.PI * 2 / circleRes;
            var x = Math.cos(angle) * radius * b2utils_1.b2Utils.B2_SCALE + cx;
            var y = Math.sin(angle) * radius * b2utils_1.b2Utils.B2_SCALE + cy;
            geometry.vertices[i].set(x, y, 0);
        }
        // close by drawing the first vert again
        var x = Math.cos(0) * radius * b2utils_1.b2Utils.B2_SCALE + cx;
        var y = Math.sin(0) * radius * b2utils_1.b2Utils.B2_SCALE + cy;
        geometry.vertices[i].set(x, y, 0);
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
    return ThreeJsDebugDraw;
}());
exports.ThreeJsDebugDraw = ThreeJsDebugDraw;

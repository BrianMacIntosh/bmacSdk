"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
require("../typings");
var Atlas_1 = require("./Atlas");
var Atlas_2 = require("./Atlas");
exports.Atlas = Atlas_2.Atlas;
var threejsdebugdraw_1 = require("./threejsdebugdraw");
exports.ThreeJsDebugDraw = threejsdebugdraw_1.ThreeJsDebugDraw;
var shaker_1 = require("./shaker");
exports.Shaker = shaker_1.Shaker;
var ThreeManager = (function () {
    function ThreeManager() {
        this.c_planeCorrection = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI, 0, 0));
        this.textureLoader = new THREE.TextureLoader();
        this.tempVector2 = new THREE.Vector2();
        this.tempVector3 = new THREE.Vector3();
        this.vector2Pool = [];
        this.vector3Pool = [];
        /**
         * If set, all mesh creation calls return dummy objects instead of real visual objects.
         */
        this.serverMode = false;
        this.textureCache = {};
        /**
         * Map of callbacks waiting on each texture to load.
         */
        this.textureCallbacks = {};
        this.atlasCache = {};
    }
    /**
     * Returns an empty {THREE.Vector2}.
     */
    ThreeManager.prototype.newVector2 = function (x, y) {
        if (this.vector2Pool.length > 0) {
            var vec = this.vector2Pool.pop();
            if (x !== undefined)
                vec.set(x, y);
            return vec;
        }
        else
            return new THREE.Vector2(x, y);
    };
    /**
     * Returns an empty {THREE.Vector3}.
     */
    ThreeManager.prototype.newVector3 = function (x, y, z) {
        if (this.vector3Pool.length > 0) {
            var vec = this.vector3Pool.pop();
            if (x !== undefined)
                vec.set(x, y, z);
            return vec;
        }
        else
            return new THREE.Vector3(x, y, z);
    };
    /**
     * Releases a {THREE.Vector2} to the pool.
     */
    ThreeManager.prototype.releaseVector2 = function (vec) {
        if (vec) {
            vec.x = vec.y = 0;
            this.vector2Pool.push(vec);
        }
    };
    /**
     * Releases a {THREE.Vector3} to the pool.
     */
    ThreeManager.prototype.releaseVector3 = function (vec) {
        if (vec) {
            vec.x = vec.y = vec.z = 0;
            this.vector3Pool.push(vec);
        }
    };
    /**
     * Creates a THREE.Mesh with a unique material.
     * @param {THREE.Texture} texture Texture for the mesh.
     * @param {THREE.Geometry} geometry Geometry for the mesh.
     */
    ThreeManager.prototype.makeSpriteMesh = function (texture, geometry) {
        if (this.serverMode) {
            return new THREE.Object3D();
        }
        else {
            var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
            var mesh = new THREE.Mesh(geometry, material); //HACK: any
            return mesh;
        }
    };
    ;
    /**
     * Creates a plane mesh with the specified dimensions.
     * @param {number} width The width of the plane.
     * @param {number} height The height of the plane.
     */
    ThreeManager.prototype.makeSpriteGeo = function (width, height) {
        var baseGeometry = new THREE.PlaneGeometry(width, height);
        baseGeometry.applyMatrix(this.c_planeCorrection);
        var geometry = new THREE.BufferGeometry();
        geometry = geometry.fromGeometry(baseGeometry);
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        return geometry;
    };
    ;
    /**
     * Returns the angle from 'from' to 'to'.
     */
    ThreeManager.prototype.toFromAngle = function (from, to) {
        return Math.atan2(to.y - from.y, to.x - from.x);
    };
    ;
    /**
     * Calculates the distance between two THREE.Object3D or THREE.Vector3.
     */
    ThreeManager.prototype.distance = function (thing1, thing2) {
        return Math.sqrt(this.distanceSq(thing1, thing2));
    };
    ;
    /**
     * Calculates the squared distance between two THREE.Object3D or THREE.Vector3.
     */
    ThreeManager.prototype.distanceSq = function (thing1, thing2) {
        if (thing1.position)
            var position1 = thing1.position;
        else
            var position1 = thing1;
        if (thing2.position)
            var position2 = thing1.position;
        else
            var position2 = thing2;
        var dx = position1.x - position2.x;
        var dy = position1.y - position2.y;
        return dx * dx + dy * dy;
    };
    ;
    /**
     * Loads the specified texture. Caches repeated calls.
     * @param {string} url The URL of the texture.
     * @param {(texture: THREE.Texture) => void} callback Function to call when the image is completely loaded.
     */
    ThreeManager.prototype.loadTexture = function (url, callback) {
        if (this.serverMode) {
            return undefined;
        }
        var tex = this.textureCache[url];
        if (!tex) {
            tex = this.textureCache[url] = this.textureLoader.load(url, this.imageLoadedCallback.bind(this));
            tex.relativeUrl = url;
        }
        if (callback) {
            if (tex.image && tex.image.complete) {
                callback(tex);
            }
            else {
                if (!this.textureCallbacks[url])
                    this.textureCallbacks[url] = [];
                this.textureCallbacks[url].push(callback);
            }
        }
        return tex;
    };
    ;
    /**
     * @param {any} image HTML image being loaded.
     */
    ThreeManager.prototype.imageLoadedCallback = function (texture) {
        var src = texture.relativeUrl;
        var callbacks = this.textureCallbacks[src];
        if (callbacks) {
            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i](texture);
            }
        }
        this.textureCallbacks[src] = undefined;
    };
    ;
    /**
     * Sets the texture as okay to be non-power-of-two.
     */
    ThreeManager.prototype.setTextureNpot = function (texture) {
        if (texture) {
            texture.generateMipmaps = false;
            texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.minFilter = texture.magFilter = THREE.NearestFilter;
        }
        return texture;
    };
    ;
    /**
     * Sets the UVs of the geometry to display the specified tile.
     * @param {THREE.Geometry|THREE.BufferGeometry} geometry
     * @param {number} x The x index of the tile.
     * @param {number} y The y index of the tile.
     * @param {number} countX The number of tiles horizontally on the image.
     * @param {number} countY The number of tiles vertically on the image.
     * @param {boolean} flipX Flip the image horizontally?
     * @param {boolean} flipY Flip the image vertically?
     */
    ThreeManager.prototype.setTilesheetGeometry = function (geometry, x, y, countX, countY, flipX, flipY) {
        if (geometry.isBufferGeometry) {
            return this._setTilesheetBufferGeometry(geometry, x, y, countX, countY, flipX, flipY);
        }
        else {
            return this._setTilesheetGeometry(geometry, x, y, countX, countY, flipX, flipY);
        }
    };
    ;
    ThreeManager.prototype._setTilesheetGeometry = function (geometry, x, y, countX, countY, flipX, flipY) {
        var uvs = geometry.faceVertexUvs[0];
        var l = x / countX;
        var b = 1 - y / countY;
        var r = (x + 1) / countX;
        var t = 1 - (y + 1) / countY;
        if (flipX) {
            var temp = l;
            l = r;
            r = temp;
        }
        if (flipY) {
            var temp = t;
            t = b;
            b = temp;
        }
        uvs[0][0].set(l, b);
        uvs[0][1].set(l, t);
        uvs[0][2].set(r, b);
        uvs[1][0].set(l, t);
        uvs[1][1].set(r, t);
        uvs[1][2].set(r, b);
        geometry.uvsNeedUpdate = true;
        return geometry;
    };
    ;
    ThreeManager.prototype._setTilesheetBufferGeometry = function (geometry, x, y, countX, countY, flipX, flipY) {
        var uvAttribute = geometry.getAttribute("uv");
        var uvs = uvAttribute.array;
        var l = x / countX;
        var b = 1 - y / countY;
        var r = (x + 1) / countX;
        var t = 1 - (y + 1) / countY;
        if (flipX) {
            var temp = l;
            l = r;
            r = temp;
        }
        if (flipY) {
            var temp = t;
            t = b;
            b = temp;
        }
        uvs[0] = l;
        uvs[1] = b;
        uvs[2] = l;
        uvs[3] = t;
        uvs[4] = r;
        uvs[5] = b;
        uvs[6] = l;
        uvs[7] = t;
        uvs[8] = r;
        uvs[9] = t;
        uvs[10] = r;
        uvs[11] = b;
        uvAttribute.needsUpdate = true;
        return geometry;
    };
    ;
    /**
     * Call once to initialize all atlases.
     * @param atlasData
     */
    ThreeManager.prototype.loadAtlases = function (atlasData) {
        this.allAtlasData = atlasData;
    };
    ;
    /**
     * Loads the atlas represented by the specified key or returns a cached version.
     */
    ThreeManager.prototype.loadAtlas = function (key) {
        if (!this.allAtlasData)
            throw "Atlas data has not yet been loaded with 'loadAtlases'.";
        var atlasData = this.allAtlasData[key];
        if (atlasData) {
            if (!this.atlasCache[atlasData.url]) {
                this.atlasCache[atlasData.url] = new Atlas_1.Atlas(this, atlasData);
            }
            return this.atlasCache[atlasData.url];
        }
        else {
            console.error("Tried to load unknown atlas '" + key + "'.");
            return null;
        }
    };
    ;
    /**
     * Sets an HTML div to display an image in an atlas.
     * @param {HTMLElement} element The element to configure.
     * @param {Atlas} atlas The atlas to us.
     * @param {string} key The key to use from the atlas.
     */
    ThreeManager.prototype.setElementToAtlasImage = function (element, atlas, key) {
        // set icon using background position
        var atlasCoords = atlas.sprites[key];
        if (atlasCoords === undefined) {
            atlasCoords = atlas.sprites["missing"];
        }
        if (atlasCoords !== undefined) {
            element.style["background-image"] = "url(\"" + atlas.url + "\")";
            element.style["background-position"] = (-atlasCoords[0]) + "px " + (-atlasCoords[1]) + "px";
            element.style["width"] = atlasCoords[2] + "px";
            element.style["height"] = atlasCoords[3] + "px";
        }
        return element;
    };
    ;
    /**
     * Creates a mesh for the given sprite in the atlas.
     * @param {boolean} dynamicGeometry Set if you want to be able to flip the sprite or dynamically switch its texture.
     */
    ThreeManager.prototype.makeAtlasMesh = function (atlasKey, key, dynamicGeometry, dynamicMaterial) {
        var atlas;
        if (atlasKey.isAtlas) {
            atlas = atlasKey;
        }
        else {
            atlas = this.loadAtlas(atlasKey);
        }
        if (atlas.sprites[key] === undefined) {
            console.error("Atlas '" + atlas.url + "' has no key '" + key + "'.");
            return null;
        }
        if (!atlas.sprites[key].geometry) {
            atlas.sprites[key].geometry = this.makeSpriteGeo(atlas.sprites[key][2], atlas.sprites[key][3]);
            this.setAtlasUVs(atlas.sprites[key].geometry, atlas, key);
        }
        if (!atlas.material) {
            atlas.material = new THREE.MeshBasicMaterial({
                map: atlas.texture, transparent: true
            });
        }
        var geometry;
        if (dynamicGeometry) {
            geometry = this.makeSpriteGeo(atlas.sprites[key][2], atlas.sprites[key][3]);
            this.setAtlasUVs(geometry, atlas, key);
        }
        else {
            geometry = atlas.sprites[key].geometry;
        }
        var material;
        if (dynamicMaterial) {
            if (dynamicMaterial.isMaterial) {
                material = dynamicMaterial;
            }
            else {
                material = new THREE.MeshBasicMaterial({ map: atlas.texture, transparent: true });
            }
        }
        else {
            material = atlas.material;
        }
        var mesh = new THREE.Mesh(geometry, material);
        mesh.userData = {
            atlas: atlas,
            atlasKey: key
        };
        return mesh;
    };
    ;
    /**
     * @param {number} uvChannel The index of the UV set to set.
     */
    ThreeManager.prototype.setAtlasUVs = function (geometry, atlas, key, flipX, flipY, channel) {
        if (geometry.isBufferGeometry) {
            return this._setAtlasUVsBuffer(geometry, atlas, key, flipX, flipY, channel);
        }
        else {
            return this._setAtlasUVs(geometry, atlas, key, flipX, flipY);
        }
    };
    /**
     * @param {number} uvChannel The index of the UV set to set.
     */
    ThreeManager.prototype._setAtlasUVs = function (geometry, atlas, key, flipX, flipY) {
        if (!atlas) {
            console.error("Geometry is not atlased.");
            return geometry;
        }
        if (atlas.sprites[key] === undefined) {
            console.error("Atlas '" + atlas.url + "' has no key '" + key + "'.");
            return geometry;
        }
        var uvs = geometry.faceVertexUvs[0];
        var l = atlas.sprites[key][0] / atlas.width;
        var b = (1 - atlas.sprites[key][1] / atlas.height);
        var r = l + atlas.sprites[key][2] / atlas.width;
        var t = b - atlas.sprites[key][3] / atlas.height;
        if (flipX) {
            var temp = l;
            l = r;
            r = temp;
        }
        if (flipY) {
            var temp = t;
            t = b;
            b = temp;
        }
        if (uvs[0] === undefined) {
            uvs[0] = [this.newVector2(), this.newVector2(), this.newVector2()];
        }
        uvs[0][0].set(l, b);
        uvs[0][1].set(l, t);
        uvs[0][2].set(r, b);
        if (uvs[1] === undefined) {
            uvs[1] = [this.newVector2(), this.newVector2(), this.newVector2()];
        }
        uvs[1][0].set(l, t);
        uvs[1][1].set(r, t);
        uvs[1][2].set(r, b);
        geometry.uvsNeedUpdate = true;
        return geometry;
    };
    ;
    /**
     * @param {number} uvChannel The index of the UV set to set.
     */
    ThreeManager.prototype._setAtlasUVsBuffer = function (geometry, atlas, key, flipX, flipY, uvChannel) {
        if (!atlas) {
            console.error("Geometry is not atlased.");
            return geometry;
        }
        if (atlas.sprites[key] === undefined) {
            console.error("Atlas '" + atlas.url + "' has no key '" + key + "'.");
            return geometry;
        }
        if (uvChannel === undefined)
            uvChannel = 0;
        var uvChannelName = uvChannel ? "uv" + (uvChannel + 1) : "uv";
        var uvAttribute = geometry.getAttribute(uvChannelName);
        if (uvAttribute == undefined) {
            uvAttribute = new THREE.BufferAttribute(new Float32Array(12), 2);
            geometry.addAttribute(uvChannelName, uvAttribute);
        }
        var l = atlas.sprites[key][0] / atlas.width;
        var b = (1 - atlas.sprites[key][1] / atlas.height);
        var r = l + atlas.sprites[key][2] / atlas.width;
        var t = b - atlas.sprites[key][3] / atlas.height;
        if (flipX) {
            var temp = l;
            l = r;
            r = temp;
        }
        if (flipY) {
            var temp = t;
            t = b;
            b = temp;
        }
        var array = uvAttribute.array;
        array[0] = l;
        array[1] = b;
        array[2] = l;
        array[3] = t;
        array[4] = r;
        array[5] = b;
        array[6] = l;
        array[7] = t;
        array[8] = r;
        array[9] = t;
        array[10] = r;
        array[11] = b;
        uvAttribute.needsUpdate = true;
        return geometry;
    };
    ;
    /**
     * Sets the UVs of the specified geometry to display the specified atlas sprite.
     */
    ThreeManager.prototype.setAtlasGeometry = function (geometry, atlas, key, flipX, flipY) {
        if (!atlas) {
            console.error("Geometry is not atlased.");
            return geometry;
        }
        if (atlas.sprites[key] === undefined) {
            console.error("Atlas '" + atlas.url + "' has not key '" + key + "'");
            return geometry;
        }
        this.setAtlasUVs(geometry, atlas, key, flipX, flipY);
        var w = atlas.sprites[key][2] / 2;
        var h = atlas.sprites[key][3] / 2;
        var vertAttribute = geometry.getAttribute("position");
        var array = vertAttribute.array;
        array[0] = -w;
        array[1] = -h;
        array[2] = 0;
        array[3] = -w;
        array[4] = h;
        array[5] = 0;
        array[6] = w;
        array[7] = -h;
        array[8] = 0;
        array[9] = -w;
        array[10] = h;
        array[11] = 0;
        array[12] = w;
        array[13] = h;
        array[14] = 0;
        array[15] = w;
        array[16] = -h;
        array[17] = 0;
        vertAttribute.needsUpdate = true;
        return geometry;
    };
    ;
    /**
     * Sets the flipped state of the specified atlas mesh.
     */
    ThreeManager.prototype.setAtlasMeshFlip = function (mesh, flipX, flipY) {
        if (!mesh.geometry) {
            return mesh;
        }
        if (flipX == mesh.userData.atlasFlipX && flipY == mesh.userData.atlasFlipY) {
            return mesh;
        }
        if (!mesh.userData.atlas) {
            console.error("mesh is not atlased.");
            return mesh;
        }
        mesh.userData.atlasFlipX = flipX;
        mesh.userData.atlasFlipY = flipY;
        this.setAtlasUVs(mesh.geometry, mesh.userData.atlas, mesh.userData.atlasKey, flipX, flipY);
        return mesh;
    };
    ;
    /**
     * Sets the UVs of the specified atlas mesh to the specified sprite key.
     */
    ThreeManager.prototype.setAtlasMeshKey = function (mesh, key) {
        if (!mesh.geometry) {
            return mesh;
        }
        if (!mesh.geometry.isBufferGeometry) {
            console.error("mesh.geometry is not a BufferGeometry");
            return mesh;
        }
        if (!mesh.userData.atlas) {
            console.error("mesh is not atlased.");
            return mesh;
        }
        if (key === mesh.userData.atlasKey) {
            return mesh;
        }
        mesh.userData.atlasKey = key;
        this.setAtlasGeometry(mesh.geometry, mesh.userData.atlas, mesh.userData.atlasKey, mesh.userData.atlasFlipX, mesh.userData.atlasFlipY);
        return mesh;
    };
    ;
    /**
     * Returns true if the line passing through a and b intersects the specified circle.
     * @param {THREE.Vector2} center The center of the circle.
     * @param {number} radius The radius of the circle.
     */
    ThreeManager.prototype.lineCircleIntersection = function (a, b, center, radius) {
        var attackVector = this.newVector2().subVectors(b, a).normalize();
        var meToTargetVector = this.newVector2().subVectors(center, a);
        var dot = meToTargetVector.dot(attackVector);
        attackVector.multiplyScalar(dot).add(a).sub(center);
        var result = attackVector.lengthSq() <= radius * radius;
        this.releaseVector2(attackVector);
        this.releaseVector2(meToTargetVector);
        return result;
    };
    ;
    /**
     * Returns true if the line segment from a to b intersects the specified circle.
     * @param {THREE.Vector2} center The center of the circle.
     * @param {number} radius The radius of the circle.
     */
    ThreeManager.prototype.lineSegmentCircleIntersection = function (a, b, center, radius) {
        var attackVector = this.newVector2().subVectors(b, a);
        var segmentLengthSq = attackVector.lengthSq();
        attackVector.normalize();
        var meToTargetVector = this.newVector2().subVectors(center, a);
        var dot = meToTargetVector.dot(attackVector);
        this.releaseVector2(meToTargetVector);
        attackVector.multiplyScalar(dot).add(a).sub(center);
        // circle is behind the segment
        if (dot < 0)
            return false;
        attackVector.normalize().multiplyScalar(dot);
        // check that the segment range is correct
        var result = false;
        var projectionLengthSq = attackVector.lengthSq();
        if (projectionLengthSq <= segmentLengthSq) {
            // check that the line is within the circle
            attackVector = attackVector.sub(center).add(a);
            result = attackVector.lengthSq() <= radius * radius;
        }
        this.releaseVector2(attackVector);
        return result;
    };
    ;
    return ThreeManager;
}());
exports.ThreeManager = ThreeManager;

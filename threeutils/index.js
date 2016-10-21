"use strict";
var THREE = require("three");
exports.THREE = THREE;
var Atlas_1 = require("./Atlas");
var Atlas_2 = require("./Atlas");
exports.Atlas = Atlas_2.Atlas;
var threejsdebugdraw_1 = require("./threejsdebugdraw");
exports.ThreeJsDebugDraw = threejsdebugdraw_1.ThreeJsDebugDraw;
var shaker_1 = require('./shaker');
exports.Shaker = shaker_1.Shaker;
var ThreeUtils;
(function (ThreeUtils) {
    ThreeUtils.c_planeCorrection = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI, 0, 0));
    ThreeUtils.textureLoader = new THREE.TextureLoader();
    ThreeUtils.tempVector2 = new THREE.Vector2();
    ThreeUtils.tempVector3 = new THREE.Vector3();
    /**
     * If set, all mesh creation calls return dummy objects instead of real visual objects.
     */
    ThreeUtils.serverMode = false;
    var textureCache = {};
    var atlasCache = {};
    /**
     * Creates a THREE.Mesh with a unique material.
     * @param {THREE.Texture} texture Texture for the mesh.
     * @param {THREE.Geometry} geometry Geometry for the mesh.
     */
    function makeSpriteMesh(texture, geometry) {
        if (ThreeUtils.serverMode) {
            return new THREE.Object3D();
        }
        else {
            var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
            var mesh = new THREE.Mesh(geometry, material); //HACK: any
            return mesh;
        }
    }
    ThreeUtils.makeSpriteMesh = makeSpriteMesh;
    ;
    /**
     * Creates a plane mesh with the specified dimensions.
     * @param {number} width The width of the plane.
     * @param {number} height The height of the plane.
     */
    function makeSpriteGeo(width, height) {
        var baseGeometry = new THREE.PlaneGeometry(width, height);
        baseGeometry.applyMatrix(ThreeUtils.c_planeCorrection);
        var geometry = new THREE.BufferGeometry();
        geometry = geometry.fromGeometry(baseGeometry);
        return geometry;
    }
    ThreeUtils.makeSpriteGeo = makeSpriteGeo;
    ;
    /**
     * Calculates the distance between two THREE.Object3D or THREE.Vector3.
     */
    function distance(thing1, thing2) {
        return Math.sqrt(ThreeUtils.distanceSq(thing1, thing2));
    }
    ThreeUtils.distance = distance;
    ;
    /**
     * Calculates the squared distance between two THREE.Object3D or THREE.Vector3.
     */
    function distanceSq(thing1, thing2) {
        if (thing1 instanceof THREE.Object3D)
            var position1 = thing1.position;
        else
            var position1 = thing1;
        if (thing2 instanceof THREE.Object3D)
            var position2 = thing2.position;
        else
            var position2 = thing2;
        var dx = position1.x - position2.x;
        var dy = position1.y - position2.y;
        return dx * dx + dy * dy;
    }
    ThreeUtils.distanceSq = distanceSq;
    ;
    /**
     * Loads the specified texture. Caches repeated calls.
     * @param {string} url The URL of the texture.
     */
    function loadTexture(url) {
        if (ThreeUtils.serverMode) {
            return undefined;
        }
        if (textureCache[url]) {
            return textureCache[url];
        }
        else {
            textureCache[url] = ThreeUtils.textureLoader.load(url);
            return textureCache[url];
        }
    }
    ThreeUtils.loadTexture = loadTexture;
    ;
    /**
     * Sets the texture as okay to be non-power-of-two.
     */
    function setTextureNpot(texture) {
        if (texture) {
            texture.generateMipmaps = false;
            texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.minFilter = texture.magFilter = THREE.NearestFilter;
        }
        return texture;
    }
    ThreeUtils.setTextureNpot = setTextureNpot;
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
    function setTilesheetGeometry(geometry, x, y, countX, countY, flipX, flipY) {
        if (geometry instanceof THREE.BufferGeometry) {
            return _setTilesheetBufferGeometry(geometry, x, y, countX, countY, flipX, flipY);
        }
        else {
            return _setTilesheetGeometry(geometry, x, y, countX, countY, flipX, flipY);
        }
    }
    ThreeUtils.setTilesheetGeometry = setTilesheetGeometry;
    ;
    function _setTilesheetGeometry(geometry, x, y, countX, countY, flipX, flipY) {
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
    }
    ;
    function _setTilesheetBufferGeometry(geometry, x, y, countX, countY, flipX, flipY) {
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
    }
    ;
    /**
     * Loads the atlas represented by the specified key or returns a cached version.
     */
    function loadAtlas(key) {
        var allData = require("../../../data/atlases.json");
        var atlasData = allData[key];
        if (atlasData) {
            if (!atlasCache[atlasData.url]) {
                atlasCache[atlasData.url] = new Atlas_1.Atlas(atlasData);
            }
            return atlasCache[atlasData.url];
        }
        else {
            console.error("Tried to load unknown atlas '" + key + "'.");
            return null;
        }
    }
    ThreeUtils.loadAtlas = loadAtlas;
    ;
    /**
     * Sets an HTML div to display an image in an atlas.
     * @param {HTMLElement} element The element to configure.
     * @param {Atlas} atlas The atlas to us.
     * @param {string} key The key to use from the atlas.
     */
    function setElementToAtlasImage(element, atlas, key) {
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
    }
    ThreeUtils.setElementToAtlasImage = setElementToAtlasImage;
    ;
    /**
     * Creates a mesh for the given sprite in the atlas.
     * @param {boolean} dynamicGeometry Set if you want to be able to flip the sprite or dynamically switch its texture.
     */
    function makeAtlasMesh(atlas, key, dynamicGeometry, dynamicMaterial) {
        if (atlas.sprites[key] === undefined) {
            console.error("Atlas '" + atlas.url + "' has no key '" + key + "'.");
            return null;
        }
        if (!atlas.sprites[key].geometry) {
            atlas.sprites[key].geometry = makeSpriteGeo(atlas.sprites[key][2], atlas.sprites[key][3]);
            setAtlasUVs(atlas.sprites[key].geometry, atlas, key);
        }
        if (!atlas.material) {
            atlas.material = new THREE.MeshBasicMaterial({
                map: atlas.texture, transparent: true });
        }
        var geometry;
        if (dynamicGeometry) {
            geometry = makeSpriteGeo(atlas.sprites[key][2], atlas.sprites[key][3]);
            setAtlasUVs(geometry, atlas, key);
            geometry.atlas_flipx = false;
            geometry.atlas_flipy = false;
        }
        else {
            geometry = atlas.sprites[key].geometry;
        }
        var material;
        if (dynamicMaterial) {
            if (dynamicMaterial instanceof THREE.Material) {
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
        mesh.atlas = atlas;
        mesh.atlas_key = key;
        return mesh;
    }
    ThreeUtils.makeAtlasMesh = makeAtlasMesh;
    ;
    /**
     * @param {number} uvChannel The index of the UV set to set.
     */
    function setAtlasUVs(geometry, atlas, key, flipX, flipY, channel) {
        if (geometry instanceof THREE.BufferGeometry) {
            return _setAtlasUVsBuffer(geometry, atlas, key, flipX, flipY, channel);
        }
        else {
            return _setAtlasUVs(geometry, atlas, key, flipX, flipY);
        }
    }
    ThreeUtils.setAtlasUVs = setAtlasUVs;
    /**
     * @param {number} uvChannel The index of the UV set to set.
     */
    function _setAtlasUVs(geometry, atlas, key, flipX, flipY) {
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
            uvs[0] = [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()];
        }
        uvs[0][0].set(l, b);
        uvs[0][1].set(l, t);
        uvs[0][2].set(r, b);
        if (uvs[1] === undefined) {
            uvs[1] = [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()];
        }
        uvs[1][0].set(l, t);
        uvs[1][1].set(r, t);
        uvs[1][2].set(r, b);
        geometry.uvsNeedUpdate = true;
        return geometry;
    }
    ;
    /**
     * @param {number} uvChannel The index of the UV set to set.
     */
    function _setAtlasUVsBuffer(geometry, atlas, key, flipX, flipY, uvChannel) {
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
    }
    ;
    /**
     * Sets the UVs of the specified geometry to display the specified atlas sprite.
     */
    function setAtlasGeometry(geometry, atlas, key, flipX, flipY) {
        if (!atlas) {
            console.error("Geometry is not atlased.");
            return geometry;
        }
        if (atlas.sprites[key] === undefined) {
            console.error("Atlas '" + atlas.url + "' has not key '" + key + "'");
            return geometry;
        }
        setAtlasUVs(geometry, atlas, key, flipX, flipY);
        var w = atlas.sprites[key][2] / 2;
        var h = atlas.sprites[key][3] / 2;
        var vertAttribute = geometry.getAttribute("position");
        var array = vertAttribute.array;
        array[0] = -w;
        array[1] = -h;
        array[2] = 0;
        array[3] = w;
        array[4] = -h;
        array[5] = 0;
        array[6] = -w;
        array[7] = h;
        array[8] = 0;
        array[9] = w;
        array[10] = h;
        array[11] = 0;
        vertAttribute.needsUpdate = true;
        return geometry;
    }
    ThreeUtils.setAtlasGeometry = setAtlasGeometry;
    ;
    /**
     * Sets the flipped state of the specified atlas mesh.
     */
    function setAtlasMeshFlip(mesh, flipX, flipY) {
        if (!mesh.geometry) {
            return mesh;
        }
        if (flipX == mesh.geometry.atlas_flipx && flipY == mesh.geometry.atlas_flipy) {
            return mesh;
        }
        mesh.geometry.atlas_flipx = flipX;
        mesh.geometry.atlas_flipy = flipY;
        setAtlasUVs(mesh.geometry, mesh.atlas, mesh.atlas_key, flipX, flipY);
        return mesh;
    }
    ThreeUtils.setAtlasMeshFlip = setAtlasMeshFlip;
    ;
    /**
     * Sets the UVs of the specified atlas mesh to the specified sprite key.
     */
    function setAtlasMeshKey(mesh, key) {
        if (!mesh.geometry) {
            return mesh;
        }
        if (key === mesh.atlas_key) {
            return mesh;
        }
        mesh.atlas_key = key;
        setAtlasGeometry(mesh.geometry, mesh.atlas, mesh.atlas_key, mesh.atlas_flipx, mesh.atlas_flipy);
        return mesh;
    }
    ThreeUtils.setAtlasMeshKey = setAtlasMeshKey;
    ;
    /**
     * Returns true if the line passing through a and b intersects the specified circle.
     * @param {THREE.Vector2} center The center of the circle.
     * @param {number} radius The radius of the circle.
     */
    function lineCircleIntersection(a, b, center, radius) {
        var attackVector = new THREE.Vector2().subVectors(b, a).normalize();
        var meToTargetVector = new THREE.Vector2().subVectors(center, a);
        var dot = meToTargetVector.dot(attackVector);
        attackVector.multiplyScalar(dot).add(a).sub(center);
        return attackVector.lengthSq() <= radius * radius;
    }
    ThreeUtils.lineCircleIntersection = lineCircleIntersection;
    ;
    /**
     * Returns true if the line segment from a to b intersects the specified circle.
     * @param {THREE.Vector2} center The center of the circle.
     * @param {number} radius The radius of the circle.
     */
    function lineSegmentCircleIntersection(a, b, center, radius) {
        var attackVector = new THREE.Vector2().subVectors(b, a);
        var segmentLengthSq = attackVector.lengthSq();
        attackVector.normalize();
        var meToTargetVector = new THREE.Vector2().subVectors(center, a);
        var dot = meToTargetVector.dot(attackVector);
        attackVector.multiplyScalar(dot).add(a).sub(center);
        // circle is behind the segment
        if (dot < 0)
            return false;
        attackVector.normalize().multiplyScalar(dot);
        // check that the segment range is correct
        var projectionLengthSq = attackVector.lengthSq();
        if (projectionLengthSq > segmentLengthSq) {
            return false;
        }
        // check that the line is within the circle
        attackVector = attackVector.sub(center).add(a);
        return attackVector.lengthSq() <= radius * radius;
    }
    ThreeUtils.lineSegmentCircleIntersection = lineSegmentCircleIntersection;
    ;
})(ThreeUtils = exports.ThreeUtils || (exports.ThreeUtils = {}));

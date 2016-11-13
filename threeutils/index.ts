
import THREE = require("three")

import { Atlas } from "./Atlas";

export { Atlas } from "./Atlas";
export { ThreeJsDebugDraw } from "./threejsdebugdraw";
export { THREE };
export { Shaker } from './shaker';

export module ThreeUtils
{
	export var c_planeCorrection: THREE.Matrix4 = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI, 0, 0));
	
	export var textureLoader = new THREE.TextureLoader();

	export var tempVector2: THREE.Vector2 = new THREE.Vector2();

	export var tempVector3: THREE.Vector3 = new THREE.Vector3();

	/**
	 * If set, all mesh creation calls return dummy objects instead of real visual objects.
	 */
	export var serverMode: boolean = false;

	var textureCache: { [s: string]: THREE.Texture } = {};

	/**
	 * Map of callbacks waiting on each texture to load.
	 */
	var textureCallbacks: { [s: string]: ((texture: THREE.Texture) => void)[]} = {};

	var atlasCache: { [s: string]: Atlas } = {};

	/**
	 * Creates a THREE.Mesh with a unique material.
	 * @param {THREE.Texture} texture Texture for the mesh.
	 * @param {THREE.Geometry} geometry Geometry for the mesh.
	 */
	export function makeSpriteMesh(texture: THREE.Texture, geometry: THREE.Geometry|THREE.BufferGeometry): THREE.Mesh
	{
		if (serverMode)
		{
			return new THREE.Object3D() as THREE.Mesh;
		}
		else
		{
			var material = new THREE.MeshBasicMaterial({ map:texture, transparent:true });
			var mesh = new THREE.Mesh((geometry as any), material); //HACK: any
			return mesh;
		}
	};

	/**
	 * Creates a plane mesh with the specified dimensions.
	 * @param {number} width The width of the plane.
	 * @param {number} height The height of the plane.
	 */
	export function makeSpriteGeo(width: number, height: number): THREE.BufferGeometry
	{
		var baseGeometry = new THREE.PlaneGeometry(width, height);
		baseGeometry.applyMatrix(ThreeUtils.c_planeCorrection);
		var geometry = new THREE.BufferGeometry();
		geometry = geometry.fromGeometry(baseGeometry);
		return geometry;
	};

	/**
	 * Returns the angle from 'from' to 'to'.
	 */
	export function toFromAngle(from: THREE.Vector2, to: THREE.Vector2): number
	{
		return Math.atan2(to.y - from.y, to.x - from.x);
	};

	/**
	 * Calculates the distance between two THREE.Object3D or THREE.Vector3.
	 */
	export function distance(thing1: THREE.Object3D, thing2: THREE.Object3D): number
	{
		return Math.sqrt(ThreeUtils.distanceSq(thing1, thing2));
	};

	/**
	 * Calculates the squared distance between two THREE.Object3D or THREE.Vector3.
	 */
	export function distanceSq(thing1: THREE.Object3D|THREE.Vector3, thing2: THREE.Object3D|THREE.Vector3): number
	{
		if (thing1 instanceof THREE.Object3D)
			var position1 = thing1.position;
		else
			var position1 = thing1;
		if (thing2 instanceof THREE.Object3D)
			var position2 = thing2.position;
		else
			var position2 = thing2;
		var dx = position1.x-position2.x;
		var dy = position1.y-position2.y;
		return dx*dx+dy*dy;
	};

	/**
	 * Loads the specified texture. Caches repeated calls.
	 * @param {string} url The URL of the texture.
	 * @param {(texture: THREE.Texture) => void} callback Function to call when the image is completely loaded.
	 */
	export function loadTexture(url: string, callback: (texture: THREE.Texture) => void): THREE.Texture
	{
		if (serverMode)
		{
			return undefined;
		}

		var tex = textureCache[url];
		if (!tex)
		{
			tex = textureCache[url] = textureLoader.load(url, imageLoadedCallback);
			(tex as any).relativeUrl = url;
		}

		if (callback)
		{
			if (tex.image && tex.image.complete)
			{
				callback(tex);
			}
			else
			{
				if (!textureCallbacks[url]) textureCallbacks[url] = [];
				textureCallbacks[url].push(callback);
			}
		}

		return tex;
	};

	/**
	 * @param {any} image HTML image being loaded.
	 */
	function imageLoadedCallback(texture: THREE.Texture)
	{
		var src = (texture as any).relativeUrl;
		var callbacks = textureCallbacks[src];
		if (callbacks)
		{
			for (var i = 0; i < callbacks.length; i++)
			{
				callbacks[i](texture);
			}
		}
		textureCallbacks[src] = undefined;
	};

	/**
	 * Sets the texture as okay to be non-power-of-two.
	 */
	export function setTextureNpot(texture: THREE.Texture): THREE.Texture
	{
		if (texture)
		{
			texture.generateMipmaps = false
			texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
			texture.minFilter = texture.magFilter = THREE.NearestFilter;
		}
		return texture;
	};

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
	export function setTilesheetGeometry(geometry: THREE.Geometry|THREE.BufferGeometry,
		x: number, y: number,
		countX: number, countY: number,
		flipX: boolean, flipY: boolean): THREE.Geometry|THREE.BufferGeometry
	{
		if (geometry instanceof THREE.BufferGeometry)
		{
			return _setTilesheetBufferGeometry(geometry, x, y, countX, countY, flipX, flipY);
		}
		else
		{
			return _setTilesheetGeometry(geometry, x, y, countX, countY, flipX, flipY);
		}
	};

	function _setTilesheetGeometry(geometry: THREE.Geometry,
		x: number, y: number,
		countX: number, countY: number,
		flipX: boolean, flipY: boolean): THREE.Geometry
	{
		var uvs = geometry.faceVertexUvs[0];
		var l = x/countX;
		var b = 1-y/countY;
		var r = (x+1)/countX;
		var t = 1-(y+1)/countY;
		if (flipX){var temp=l;l=r;r=temp;}
		if (flipY){var temp=t;t=b;b=temp;}
		uvs[0][0].set(l,b);
		uvs[0][1].set(l,t);
		uvs[0][2].set(r,b);
		uvs[1][0].set(l,t);
		uvs[1][1].set(r,t);
		uvs[1][2].set(r,b);
		geometry.uvsNeedUpdate = true;
		return geometry;
	};

	function _setTilesheetBufferGeometry(geometry: THREE.BufferGeometry,
		x: number, y: number,
		countX: number, countY: number,
		flipX: boolean, flipY: boolean): THREE.BufferGeometry
	{
		var uvAttribute = geometry.getAttribute("uv") as THREE.BufferAttribute;
		var uvs = uvAttribute.array as Float32Array;
		var l = x/countX;
		var b = 1-y/countY;
		var r = (x+1)/countX;
		var t = 1-(y+1)/countY;
		if (flipX){var temp=l;l=r;r=temp;}
		if (flipY){var temp=t;t=b;b=temp;}
		uvs[0] = l; uvs[1] = b;
		uvs[2] = l; uvs[3] = t;
		uvs[4] = r; uvs[5] = b;

		uvs[6] = l; uvs[7] = t;
		uvs[8] = r; uvs[9] = t;
		uvs[10] = r; uvs[11] = b;
		uvAttribute.needsUpdate = true;
		return geometry;
	};

	/**
	 * Loads the atlas represented by the specified key or returns a cached version.
	 */
	export function loadAtlas(key: string): Atlas
	{
		var allData = require("../../../data/atlases.json");
		var atlasData = allData[key];
		if (atlasData)
		{
			if (!atlasCache[atlasData.url])
			{
				atlasCache[atlasData.url] = new Atlas(atlasData);
			}
			return atlasCache[atlasData.url];
		}
		else
		{
			console.error("Tried to load unknown atlas '" + key + "'.");
			return null;
		}
	};

	/**
	 * Sets an HTML div to display an image in an atlas.
	 * @param {HTMLElement} element The element to configure.
	 * @param {Atlas} atlas The atlas to us.
	 * @param {string} key The key to use from the atlas.
	 */
	export function setElementToAtlasImage(element: HTMLElement, atlas: Atlas, key: string): HTMLElement
	{
		// set icon using background position
		var atlasCoords = atlas.sprites[key];
		if (atlasCoords === undefined)
		{
			atlasCoords = atlas.sprites["missing"];
		}
		if (atlasCoords !== undefined)
		{
			element.style["background-image"] = "url(\"" + atlas.url + "\")";
			element.style["background-position"] = (-atlasCoords[0]) + "px " + (-atlasCoords[1]) + "px";
			element.style["width"] = atlasCoords[2] + "px";
			element.style["height"] = atlasCoords[3] + "px";
		}
		return element;
	};

	/**
	 * Creates a mesh for the given sprite in the atlas.
	 * @param {boolean} dynamicGeometry Set if you want to be able to flip the sprite or dynamically switch its texture.
	 */
	export function makeAtlasMesh(atlas: Atlas, key: string,
		dynamicGeometry?: boolean,
		dynamicMaterial?: boolean|THREE.Material): THREE.Mesh
	{
		if (atlas.sprites[key] === undefined)
		{
			console.error("Atlas '"+atlas.url+"' has no key '"+key+"'.");
			return null;
		}
		if (!atlas.sprites[key].geometry)
		{
			atlas.sprites[key].geometry = makeSpriteGeo(atlas.sprites[key][2], atlas.sprites[key][3]);
			setAtlasUVs(atlas.sprites[key].geometry, atlas, key);
		}
		if (!atlas.material)
		{
			atlas.material = new THREE.MeshBasicMaterial({
				map:atlas.texture, transparent:true });
		}

		var geometry: THREE.BufferGeometry;
		if (dynamicGeometry)
		{
			geometry = makeSpriteGeo(atlas.sprites[key][2], atlas.sprites[key][3]);
			setAtlasUVs(geometry, atlas, key);
		}
		else
		{
			geometry = atlas.sprites[key].geometry;
		}

		var material;
		if (dynamicMaterial)
		{
			if (dynamicMaterial instanceof THREE.Material)
			{
				material = dynamicMaterial;
			}
			else
			{
				material = new THREE.MeshBasicMaterial({map:atlas.texture, transparent:true});
			}
		}
		else
		{
			material = atlas.material;
		}

		var mesh = new THREE.Mesh(geometry, material);
		mesh.userData = {
			atlas: atlas,
			atlasKey: key
		}
		return mesh;
	};

	/**
	 * @param {number} uvChannel The index of the UV set to set.
	 */
	export function setAtlasUVs(
		geometry: THREE.Geometry|THREE.BufferGeometry,
		atlas: Atlas, key: string,
		flipX?: boolean, flipY?: boolean,
		channel?: number): THREE.Geometry|THREE.BufferGeometry
	{
		if (geometry instanceof THREE.BufferGeometry)
		{
			return _setAtlasUVsBuffer(geometry, atlas, key, flipX, flipY, channel);
		}
		else
		{
			return _setAtlasUVs(geometry, atlas, key, flipX, flipY);
		}
	}

	/**
	 * @param {number} uvChannel The index of the UV set to set.
	 */
	function _setAtlasUVs(
		geometry: THREE.Geometry,
		atlas: Atlas, key: string,
		flipX?: boolean, flipY?: boolean): THREE.Geometry
	{
		if (!atlas)
		{
			console.error("Geometry is not atlased.");
			return geometry;
		}
		if (atlas.sprites[key] === undefined)
		{
			console.error("Atlas '"+atlas.url+"' has no key '"+key+"'.");
			return geometry;
		}

		var uvs = geometry.faceVertexUvs[0];
		var l = atlas.sprites[key][0]/atlas.width;
		var b = (1-atlas.sprites[key][1]/atlas.height);
		var r = l+atlas.sprites[key][2]/atlas.width;
		var t = b-atlas.sprites[key][3]/atlas.height;
		if (flipX){var temp=l;l=r;r=temp;}
		if (flipY){var temp=t;t=b;b=temp;}
		if (uvs[0] === undefined)
		{
			uvs[0] = [new THREE.Vector2(),new THREE.Vector2(),new THREE.Vector2()];
		}
		uvs[0][0].set(l,b);
		uvs[0][1].set(l,t);
		uvs[0][2].set(r,b);
		if (uvs[1] === undefined)
		{
			uvs[1] = [new THREE.Vector2(),new THREE.Vector2(),new THREE.Vector2()];
		}
		uvs[1][0].set(l,t);
		uvs[1][1].set(r,t);
		uvs[1][2].set(r,b);
		geometry.uvsNeedUpdate = true;
		return geometry;
	};

	/**
	 * @param {number} uvChannel The index of the UV set to set.
	 */
	function _setAtlasUVsBuffer(
		geometry: THREE.BufferGeometry,
		atlas: Atlas, key: string,
		flipX?: boolean, flipY?: boolean,
		uvChannel?: number): THREE.BufferGeometry
	{
		if (!atlas)
		{
			console.error("Geometry is not atlased.");
			return geometry;
		}
		if (atlas.sprites[key] === undefined)
		{
			console.error("Atlas '"+atlas.url+"' has no key '"+key+"'.");
			return geometry;
		}

		if (uvChannel === undefined) uvChannel = 0;
		var uvChannelName = uvChannel ? "uv" + (uvChannel+1) : "uv";
		var uvAttribute = geometry.getAttribute(uvChannelName) as THREE.BufferAttribute;
		if (uvAttribute == undefined)
		{
			uvAttribute = new THREE.BufferAttribute(new Float32Array(12), 2);
			geometry.addAttribute(uvChannelName, uvAttribute);
		}
		
		var l = atlas.sprites[key][0]/atlas.width;
		var b = (1-atlas.sprites[key][1]/atlas.height);
		var r = l+atlas.sprites[key][2]/atlas.width;
		var t = b-atlas.sprites[key][3]/atlas.height;
		if (flipX){var temp=l;l=r;r=temp;}
		if (flipY){var temp=t;t=b;b=temp;}
		
		var array = uvAttribute.array as Float32Array;
		array[0] = l; array[1] = b;
		array[2] = l; array[3] = t;
		array[4] = r; array[5] = b;
		
		array[6] = l; array[7] = t;
		array[8] = r; array[9] = t;
		array[10] = r; array[11] = b;
		uvAttribute.needsUpdate = true;
		return geometry;
	};

	/**
	 * Sets the UVs of the specified geometry to display the specified atlas sprite.
	 */
	export function setAtlasGeometry(
		geometry: THREE.BufferGeometry,
		atlas: Atlas, key: string,
		flipX?: boolean, flipY?: boolean): THREE.BufferGeometry
	{
		if (!atlas)
		{
			console.error("Geometry is not atlased.");
			return geometry;
		}
		if (atlas.sprites[key] === undefined)
		{
			console.error("Atlas '"+atlas.url+"' has not key '"+key+"'");
			return geometry;
		}
		setAtlasUVs(geometry,atlas,key,flipX,flipY);
		
		var w = atlas.sprites[key][2]/2;
		var h = atlas.sprites[key][3]/2;
		var vertAttribute = geometry.getAttribute("position") as THREE.BufferAttribute;
		var array = vertAttribute.array as Float32Array;
		array[0] = -w; array[1] = -h; array[2] = 0;
		array[3] = w; array[4] = -h; array[5] = 0;
		array[6] = -w; array[7] = h; array[8] = 0;
		array[9] = w; array[10] = h; array[11] = 0;
		vertAttribute.needsUpdate = true;
		return geometry;
	};

	/**
	 * Sets the flipped state of the specified atlas mesh.
	 */
	export function setAtlasMeshFlip(mesh: THREE.Mesh, flipX: boolean, flipY: boolean): THREE.Mesh
	{
		if (!mesh.geometry)
		{
			return mesh;
		}
		if (flipX == mesh.userData.atlasFlipX && flipY == mesh.userData.atlasFlipY)
		{
			return mesh;
		}
		if (!mesh.userData.atlas)
		{
			console.error("mesh is not atlased.");
			return mesh;
		}
		mesh.userData.atlasFlipX = flipX;
		mesh.userData.atlasFlipY = flipY;
		setAtlasUVs(mesh.geometry, mesh.userData.atlas, mesh.userData.atlasKey, flipX, flipY);
		return mesh;
	};

	/**
	 * Sets the UVs of the specified atlas mesh to the specified sprite key.
	 */
	export function setAtlasMeshKey(mesh: THREE.Mesh, key: string): THREE.Mesh
	{
		if (!mesh.geometry)
		{
			return mesh;
		}
		if (!(mesh.geometry instanceof THREE.BufferGeometry))
		{
			console.error("mesh.geometry is not a BufferGeometry");
			return mesh;
		}
		if (!mesh.userData.atlas)
		{
			console.error("mesh is not atlased.");
			return mesh;
		}
		if (key === mesh.userData.atlasKey) 
		{
			return mesh;
		}
		mesh.userData.atlasKey = key;
		setAtlasGeometry(mesh.geometry, mesh.userData.atlas, mesh.userData.atlasKey,
			mesh.userData.atlasFlipX, mesh.userData.atlasFlipY);
		return mesh;
	};

	/**
	 * Returns true if the line passing through a and b intersects the specified circle.
	 * @param {THREE.Vector2} center The center of the circle.
	 * @param {number} radius The radius of the circle.
	 */
	export function lineCircleIntersection(a: THREE.Vector2, b: THREE.Vector2, center: THREE.Vector2, radius: number): boolean
	{
		var attackVector = new THREE.Vector2().subVectors(b, a).normalize();
		var meToTargetVector = new THREE.Vector2().subVectors(center, a);
		var dot = meToTargetVector.dot(attackVector);
		attackVector.multiplyScalar(dot).add(a).sub(center);

		return attackVector.lengthSq() <= radius * radius;
	};

	/**
	 * Returns true if the line segment from a to b intersects the specified circle.
	 * @param {THREE.Vector2} center The center of the circle.
	 * @param {number} radius The radius of the circle.
	 */
	export function lineSegmentCircleIntersection(a: THREE.Vector2, b: THREE.Vector2, center: THREE.Vector2, radius: number): boolean
	{
		var attackVector = new THREE.Vector2().subVectors(b, a);
		var segmentLengthSq = attackVector.lengthSq();
		attackVector.normalize();
		var meToTargetVector = new THREE.Vector2().subVectors(center, a);
		var dot = meToTargetVector.dot(attackVector);
		attackVector.multiplyScalar(dot).add(a).sub(center);
		
		// circle is behind the segment
		if (dot < 0) return false;
		
		attackVector.normalize().multiplyScalar(dot);
		
		// check that the segment range is correct
		var projectionLengthSq = attackVector.lengthSq();
		if (projectionLengthSq > segmentLengthSq)
		{
			return false;
		}
		
		// check that the line is within the circle
		attackVector = attackVector.sub(center).add(a);
		return attackVector.lengthSq() <= radius * radius;
	};
}

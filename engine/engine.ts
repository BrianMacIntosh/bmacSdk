
import THREE = require("three")

import { bmacSdk } from "./";
import { Mouse } from "../input";
import { ThreeUtils, Shaker } from "../threeutils";
import { DomUtils } from "../domutils";
import { THREEX } from "../thirdparty/threex.rendererstats";

//TODO: engine should set up Box2D world and listeners for you

export class EngineObject
{
	/**
	 * The GameEngine this object belongs to.
	 * @type {Engine}
	 */
	owner: Engine;

	constructor()
	{

	};

	added() { };
	removed() { };
	update(deltaSec: number) { };
};

/**
 * An Engine has a scene and a camera and manages game objects that are added to it.
 * @param {string} canvasDivName The name of the HTML element the canvas should be added to.
 */
export class Engine
{
	private debugRenderer: boolean = true;

	private objects: EngineObject[] = [];
	private canvasDivName: string;
	private canvasDiv: HTMLCanvasElement;

	public scene: THREE.Scene = new THREE.Scene();
	public mainCamera: THREE.OrthographicCamera;

	/**
	 * Screenshake parent for the main camera.
	 */
	public cameraShaker: Shaker;

	private cameraZoom: number = 1;

	private renderer: THREE.WebGLRenderer;

	public screenWidth: number;
	public screenHeight: number;

	public mousePosRel: THREE.Vector2;
	public mousePosWorld: THREE.Vector2;

	private rendererStats: any;

	constructor(canvasDivName: string)
	{
		this.canvasDivName = canvasDivName;

		this.mainCamera = new THREE.OrthographicCamera(0, 0, 0, 0, 1, 100);
		this.cameraShaker = new Shaker();
		this.scene.add(this.cameraShaker.transform);
		this.mainCamera.position.set(0,0,0);
		this.cameraShaker.transform.add(this.mainCamera);
	};

	/**
	 * Adds an object to the engine.
	 * If the object has an 'added' method, it will be called now or when the DOM is attached.
	 * If the object has an 'update' method, it will be called every frame until the object is removed.
	 * @param {Object} object
	 */
	public addObject(object: EngineObject): EngineObject
	{
		object.owner = this;
		if (this.objects.contains(object))
			return object;
		if (object.added && bmacSdk.domAttached)
			object.added();
		this.objects.push(object);
		return object;
	};

	/**
	 * Removes an object from the engine.
	 * If the object has a 'removed' method, it will be called.
	 * @param {Object} object
	 */
	public removeObject(object: EngineObject): void
	{
		if (object.removed)
			object.removed();
		this.objects.remove(object);
	};

	/**
	 * Sets the zoom level of the main camera.
	 */
	public setCameraZoom(factor: number)
	{
		this.cameraZoom = Math.clamp(factor, 0.1, 100);
		this._updateCameraSize();
	}

	/**
	 * Initializes the engine.
	 */
	public _attachDom(): void
	{
		if (!bmacSdk.isHeadless)
		{
			this.canvasDiv = document.getElementById(this.canvasDivName) as HTMLCanvasElement;
			this.renderer = new THREE.WebGLRenderer();
			this.canvasDiv.appendChild(this.renderer.domElement);
			this.canvasDiv.addEventListener("contextmenu", function(e) { e.preventDefault();return false; });
			this.renderer.setClearColor(0x000000, 1);

			if (this.debugRenderer)
			{
				// init renderstats
				this.rendererStats = THREEX.RendererStats();
				this.rendererStats.domElement.style.position = 'absolute';
				this.rendererStats.domElement.style.left = '0px';
				this.rendererStats.domElement.style.bottom = '0px';
				document.body.appendChild(this.rendererStats.domElement);
			}

			DomUtils.init(this.canvasDiv, this.mainCamera, this.renderer);
		}
		
		//TODO: 2D depth management
		
		this._handleWindowResize();
		
		for (var c = 0; c < this.objects.length; c++)
		{
			if (this.objects[c].added)
			{
				this.objects[c].added();
			}
		}
	};

	/**
	 * Resizes the renderer to match the size of the window.
	 */
	public _handleWindowResize(): void
	{
		if (this.canvasDiv) // for node server support
		{
			this.screenWidth = this.canvasDiv.offsetWidth;
			this.screenHeight = this.canvasDiv.offsetHeight;
			this.renderer.setSize(this.screenWidth, this.screenHeight);
		}
		this._updateCameraSize();
	};

	public _updateCameraSize()
	{
		this.mainCamera.left = (-this.screenWidth/2)/this.cameraZoom;
		this.mainCamera.right = (this.screenWidth/2)/this.cameraZoom;
		this.mainCamera.top = (-this.screenHeight/2)/this.cameraZoom;
		this.mainCamera.bottom = (this.screenHeight/2)/this.cameraZoom;
		this.mainCamera.updateProjectionMatrix();
	}

	public _animate(): void
	{
		// calculate mouse pos
		this.mousePosRel = Mouse.getPosition(this.canvasDiv, this.mousePosRel);
		if (!this.mousePosWorld) this.mousePosWorld = ThreeUtils.newVector2();
		this.mousePosWorld.set(
			this.mousePosRel.x + this.mainCamera.position.x,
			this.mousePosRel.y + this.mainCamera.position.y);
		
		// update objects
		for (var c = 0; c < this.objects.length; c++)
		{
			if (this.objects[c].update)
			{
				this.objects[c].update(bmacSdk.getDeltaSec());
			}
		}

		this.cameraShaker.update(bmacSdk.getDeltaSec());

		DomUtils.update(bmacSdk.getDeltaSec());
		
		// render
		if (this.renderer)
		{
			this.renderer.render(this.scene, this.mainCamera);
			if (this.rendererStats) this.rendererStats.update(this.renderer);
		}
	};
};

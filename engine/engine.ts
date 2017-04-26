
import THREE = require("three")
import "../typings";
import "../polyfills";

import { bmacSdk } from "./";
import { Mouse } from "../input";
import { ThreeManager, Shaker } from "../threeutils";
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

	preRender() { };
	postRender() { };
};

type ParameterlessCallback = () => any;

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

	/**
	 * If set, another engine that has the 'renderer' that this one should use.
	 */
	private shareContextWith : Engine;

	public scene: THREE.Scene = new THREE.Scene();
	public mainCamera: THREE.OrthographicCamera;

	/**
	 * Screenshake parent for the main camera.
	 */
	public cameraShaker: Shaker;

	private cameraZoom: number = 1;

	public renderer: THREE.WebGLRenderer;

	public screenWidth: number;
	public screenHeight: number;

	public mousePosRel: THREE.Vector2;
	public mousePosWorld: THREE.Vector3;
	public projectionMatrixInverse: THREE.Matrix4 = new THREE.Matrix4();

	private rendererStats: any;

	private postRenderCallbacks : ParameterlessCallback[] = [];

	/**
	 * 
	 * @param param The name of the element to create the canvas under, or an existing Engine to share with.
	 */
	constructor(public bmacSdk: bmacSdk, param: string|Engine)
	{
		if (param instanceof Engine)
		{
			this.shareContextWith = param as Engine;
		}
		else
		{
			this.canvasDivName = param as string;
		}

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
		if (object.added && this.bmacSdk.domAttached)
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

	public subscribePostRender(callback : ParameterlessCallback) : void
	{
		this.postRenderCallbacks.push(callback);
	}

	public unsubscribePostRender(callback : ParameterlessCallback) : void
	{
		this.postRenderCallbacks.remove(callback);
	}

	/**
	 * Sets the zoom level of the main camera.
	 */
	public setCameraZoom(factor: number) : void
	{
		this.cameraZoom = Math.clamp(factor, 0.1, 100);
		this._updateCameraSize();
	}

	/**
	 * Initializes the engine.
	 */
	public _attachDom() : void
	{
		if (!this.bmacSdk.isHeadless && this.canvasDivName)
		{
			this.canvasDiv = document.getElementById(this.canvasDivName) as HTMLCanvasElement;
			this.renderer = new THREE.WebGLRenderer();
			this.renderer.autoClearColor = false;
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

			//HACK: labels won't work in shared contexts
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
		var master = this.getContextMaster();
		if (master.canvasDiv) // for headless support
		{
			this.screenWidth = master.canvasDiv.offsetWidth;
			this.screenHeight = master.canvasDiv.offsetHeight;
		}
		if (this.renderer)
		{
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

	private _callPreRender()
	{
		for (var i = 0; i < this.objects.length; i++)
		{
			if (this.objects[i].preRender)
			{
				this.objects[i].preRender();
			}
		}
	}

	private _callPostRender()
	{
		for (var i = 0; i < this.objects.length; i++)
		{
			if (this.objects[i].postRender)
			{
				this.objects[i].postRender();
			}
		}
		for (var i = this.postRenderCallbacks.length - 1; i >= 0; i--)
		{
			//NOTE: will not work right if callback removes an earlier one
			this.postRenderCallbacks[i]();
		}
	}

	private getContextMaster() : Engine
	{
		if (this.shareContextWith) return this.shareContextWith.getContextMaster();
		else return this;
	}

	public _animate(deltaSec: number): void
	{
		var master = this.getContextMaster();

		// calculate mouse pos
		this.mousePosRel = this.bmacSdk.input.mouse.getPosition(master.canvasDiv, this.mousePosRel);
		if (!this.mousePosWorld) this.mousePosWorld = new THREE.Vector3();
		this.mousePosWorld.set(
			this.mousePosRel.x/(this.screenWidth/2) - 1,
			1 - this.mousePosRel.y/(this.screenHeight/2),
			0);
		this.mousePosWorld.applyMatrix4(this.projectionMatrixInverse.getInverse(this.mainCamera.projectionMatrix));
		this.mousePosWorld.applyMatrix4(this.mainCamera.matrixWorld);
		
		// update objects
		for (var c = 0; c < this.objects.length; c++)
		{
			if (this.objects[c].update)
			{
				this.objects[c].update(deltaSec);
			}
		}

		this.cameraShaker.update(deltaSec);

		DomUtils.update(deltaSec);
		
		// render
		this._callPreRender();
		if (master.renderer)
		{
			if (!this.shareContextWith) master.renderer.clearColor();
			master.renderer.render(this.scene, this.mainCamera);

			//HACK: doesn't support sharing well
			if (master == this && master.rendererStats)
			{
				master.rendererStats.update(master.renderer);
			}
		}
		else if (this.scene.autoUpdate)
		{
			this.scene.updateMatrixWorld(false); //TODO: force param?
		}
		this._callPostRender();
	};
};


import THREE = require("three")
import "../typings";
import "../polyfills";

import { Input } from "../input";
import { Engine } from "./engine";
import { AudioManager } from "../audiomanager";

export { EngineObject, Engine } from "./engine";
export { noise } from "../thirdparty/noise";

/**
 * @namespace
 */
export class bmacSdk
{
	public static instance: bmacSdk;

	/**
	 * If set, the game will not update if the window doesn't have focus.
	 * @type {boolean}
	 */
	private CFG_PAUSE_WHEN_UNFOCUSED: boolean = false;

	/**
	 * If set, the game will update each frame until the specified time has passed (ms).
	 */
	public fastSimulate: number = undefined;

	/**
	 * If set, the game will use a fixed update rate for the engine (in seconds).
	 */
	public fixedUpdateInterval: number = undefined;
	
	/**
	 * Used to ignore large frame delta after focusin
	 * @type {boolean}
	 */
	private _eatFrame: boolean = false;

	/**
	 * Read-only. Set if window or document was not found.
	 * @type {boolean}
	 */
	public isHeadless: boolean = false;
	
	/**
	 * Set to true if the window has focus.
	 * @type {boolean}
	 */
	public isFocused: boolean = true;

	public domAttached: boolean = false;

	/**
	 * Multiplier to apply to the delta time. Higher values make the game move faster.
	 * @type {number}
	 */
	public timeScale: number = 1;
	
	/**
	 * Gets the elapsed time since the last frame (in seconds).
	 * @type {number}
	 */
	public getDeltaSec(): number
	{
		return this._deltaSec * this.timeScale;
	};
	private _deltaSec: number = 0;

	/**
	 * The time of the last frame.
	 * @type {number}
	 */
	private _lastFrame: number = 0;
	
	/**
	 * List of all active Engines.
	 * @type {Engine[]}
	 */
	private engines: Engine[] = [];

	public input: Input = new Input();

	private boundAnimate: any = this._animate.bind(this);

	constructor()
	{
		bmacSdk.instance = this;
	}

	public createEngine(param: string|Engine): Engine
	{
		var engine = new Engine(this, param);
		this.engines.push(engine);
		if (this.domAttached) engine._attachDom();
		return engine;
	}

	/**
	 * Call this once to initialize the SDK.
	 */
	public initialize()
	{
		this.isHeadless = typeof window == "undefined" || typeof document == "undefined";

		if (!this.isHeadless)
		{
			var self = this;

			if (document.readyState !== "loading")
			{
				this._attachDom();
			}
			else
			{
				window.addEventListener("load", this._attachDom.bind(this));
			}

			window.addEventListener("blur", function(){
				self.isFocused = false;
			});

			window.addEventListener("focus",function(){
				self.isFocused = true;
				self._eatFrame = true;
			});
			
			window.addEventListener("resize", function(){
				if (self.domAttached)
				{
					for (var c = 0; c < self.engines.length; c++)
					{
						self.engines[c]._handleWindowResize();
					}
				}
			});
		}
	};

	/**
	 * Call this from onload of the body element. Initializes all engines.
	 */
	public _attachDom()
	{
		if (this.domAttached) return;

		console.log("bmacSdk: DOM attached");
		this.domAttached = true;
		
		for (var c = 0; c < this.engines.length; c++)
		{
			this.engines[c]._attachDom();
		}
		
		this.input._init();
		
		this._lastFrame = Date.now();

		this._animate();
	};

	/**
	 * Shut down the SDK.
	 */
	public destroy()
	{
		this.input._destroy();

		//TODO: destroy all engines

		//TODO: stop the animate loop
	};

	/**
	 * Main update loop.
	 */
	public _animate()
	{
		var simStart = Date.now();

		do
		{
			if (this.fixedUpdateInterval !== undefined)
			{
				this._deltaSec = this.fixedUpdateInterval;
			}
			else
			{
				this._deltaSec = (Date.now() - this._lastFrame) / 1000;
			}
			this._lastFrame = Date.now();
			
			if (this._eatFrame)
			{
				this._eatFrame = false;
				break;
			}
			
			if (this.CFG_PAUSE_WHEN_UNFOCUSED && !this.isFocused)
			{
				break;
			}
			
			AudioManager._update(this._deltaSec);
			this.input._update();
			
			for (var c = 0; c < this.engines.length; c++)
			{
				this.engines[c]._animate(this.getDeltaSec());
			}
		} while (this.fastSimulate !== undefined && (Date.now() - simStart) < this.fastSimulate);

		// node server doesn't have this method and needs to call this manually each frame
		if (!this.isHeadless)
		{
			requestAnimationFrame(this.boundAnimate);
		}
	};
};

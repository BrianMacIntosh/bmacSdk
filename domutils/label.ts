
import { DomUtils } from "./";

export class Label
{
	tiedTo: THREE.Object3D;
	tieOffset: THREE.Vector3;

	element: HTMLElement;

	/**
	 * 0:left, 1:center, 2:right
	 */
	alignx: number;
	aligny: number;

	constructor(cssClass: string,
		private parent: HTMLElement,
		private camera: THREE.Camera,
		private renderer: THREE.WebGLRenderer)
	{
		this.element = document.createElement("div");
		this.element.className = cssClass;
		parent.appendChild(this.element);
	}

	/**
	 * Clears this label's settings.
	 */
	public free(): void
	{
		this.tiedTo = undefined;
		this.set("", 1, 1);
		this.element.style.visibility = "hidden";
	}

	/**
	 * Ties the label's position to that of the specified object.
	 */
	public tieTo(object: THREE.Object3D, offset: THREE.Vector3): void
	{
		this.tiedTo = object;
		this.tieOffset = offset;
	}

	/**
	 * Manually set this label's position.
	 */
	public setPosition(position: THREE.Vector3): void
	{
		this.tiedTo = undefined;
		this.setPositionHelper(position);
	}

	private setPositionHelper(position: THREE.Vector3): void
	{
		var unprojected = position.clone().add(this.tieOffset).project(this.camera);
		unprojected.x = (unprojected.x / 2 + 0.5) * this.parent.offsetWidth;
		unprojected.y = (-unprojected.y / 2 + 0.5) * this.parent.offsetHeight;

		// align
		switch (this.alignx)
		{
			case 0: break;
			case 1: unprojected.x -= this.element.offsetWidth/2; break;
			case 2: unprojected.x -= this.element.offsetWidth; break;
		}
		switch (this.aligny)
		{
			case 0: break;
			case 1: unprojected.y -= this.element.offsetHeight/2; break;
			case 2: unprojected.y -= this.element.offsetHeight; break;
		}

		this.element.style.left = Math.round(unprojected.x) + "px";
		this.element.style.top = Math.round(unprojected.y) + "px";
	}

	/**
	 * @param {number} align 0:left, 1:center, 2:right
	 */
	public set(text: string, alignx: number, aligny: number): void
	{
		this.alignx = alignx;
		this.aligny = aligny;
		this.element.innerHTML = text;
		this.element.style.visibility = "visible";
	}

	public update(deltaSec: number): void
	{
		if (this.tiedTo)
		{
			this.setPositionHelper(this.tiedTo.position);
		}
	}
}

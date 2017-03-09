
import { DomUtils } from "./";
import { ThreeUtils } from "../threeutils";

export class Label
{
	tiedTo: THREE.Object3D;
	tieOffset: THREE.Vector3;

	element: HTMLElement;

	/**
	 * -0.5:left, 0:center, 0.5:right
	 */
	alignx: number;
	aligny: number;

	visibility: boolean;

	tempProjectionVector: THREE.Vector3 = new THREE.Vector3();

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
		this.set("", 0, 0);
		this.hide();
	}

	/**
	 * Ties the label's position to that of the specified object.
	 */
	public tieTo(object: THREE.Object3D, offset: THREE.Vector3): void
	{
		this.tiedTo = object;
		this.tieOffset = offset;
	}

	public show()
	{
		if (!this.visibility)
		{
			this.visibility = true;
			this.element.style.visibility = "visible";
		}
	}

	public hide()
	{
		if (this.visibility)
		{
			this.visibility = false;
			this.element.style.visibility = "hidden";
		}
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
		var unprojected = this.tempProjectionVector.addVectors(position, this.tieOffset).project(this.camera);
		unprojected.x = (unprojected.x / 2 + 0.5) * this.parent.offsetWidth;
		unprojected.y = (-unprojected.y / 2 + 0.5) * this.parent.offsetHeight;

		// align
		unprojected.x -= (this.alignx + 0.5) * this.element.offsetWidth;
		unprojected.y -= (this.aligny + 0.5) * this.element.offsetHeight;

		this.element.style.left = Math.round(unprojected.x) + "px";
		this.element.style.top = Math.round(unprojected.y) + "px";
	}

	/**
	 * @param {number} align -0.5:left, 0:center, 0.5:right
	 */
	public set(text: string, alignx: number, aligny: number): void
	{
		this.alignx = alignx;
		this.aligny = aligny;
		this.element.innerHTML = text;
		this.show();
	}

	public update(deltaSec: number): void
	{
		if (this.tiedTo)
		{
			this.setPositionHelper(this.tiedTo.position);
		}
	}
}

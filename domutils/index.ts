
import { Label } from "./label"
export { Label } from "./label"

export namespace DomUtils
{
	/**
	 * Pools of labels, indexed by CSS class.
	 */
	var labelPool: {[s: string]: Label[]} = {};

	var activeLabels: Label[] = [];

	var parent: HTMLElement;
	var camera: THREE.Camera;
	var renderer: THREE.WebGLRenderer;

	export function init(canvasDiv: HTMLElement, iCamera: THREE.Camera, iRenderer: THREE.WebGLRenderer): void
	{
		parent = canvasDiv;
		camera = iCamera;
		renderer = iRenderer;
	}

	export function createLabel(cssClass: string): Label
	{
		if (!parent)
		{
			//TODO: error?
			return undefined;
		}

		if (labelPool[cssClass] && labelPool[cssClass].length > 0)
		{
			var label = labelPool[cssClass].pop();
		}
		else
		{
			var label = new Label(cssClass, parent, camera, renderer);
		}
		activeLabels.push(label);
		return label;
	}

	/**
	 * Return a label to the pool.
	 */
	export function freeLabel(label: Label): void
	{
		if (!label)
		{
			return;
		}
		activeLabels.remove(label);
		label.free();
		if (!labelPool[label.element.className])
		{
			labelPool[label.element.className] = [];
		}
		labelPool[label.element.className].push(label);
	}

	export function update(deltaSec: number): void
	{
		for (var i = 0; i < activeLabels.length; i++)
		{
			activeLabels[i].update(deltaSec);
		}
	}
}

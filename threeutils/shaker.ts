
import THREE = require("three");
import { noise } from "../thirdparty/noise";

/**
 * Creates a threejs object that moves with Perlin noise jitter.
 */
export class Shaker
{
	public transform = new THREE.Object3D();

	contributions: ShakeData[] = [];

	constructor()
	{

	}

	public shake(speed: number, amplitude: number, duration: number): void
	{
		this.contributions.push(new ShakeData(speed, amplitude, duration));
	}

	public update(deltaSec: number): void
	{
		this.transform.position.set(0, 0, this.transform.position.z);
		for (var i = this.contributions.length - 1; i >= 0; i--)
		{
			this.contributions[i].lifeTimeLeft -= deltaSec;
			if (this.contributions[i].lifeTimeLeft <= 0)
			{
				this.contributions.splice(i, 1);
			}
			else
			{
				this.contributions[i].contribute(this.transform.position);
			}
		}
	}
}

class ShakeData
{
	public lifeTimeLeft: number;

	private ampRow: number;
	private angleRow: number;

	constructor(public frequency: number, public amplitude: number, public duration: number)
	{
		this.lifeTimeLeft = duration;
		this.ampRow = Math.random() * 1000;
		this.angleRow = Math.random() * 1000;
	}

	public contribute(accumulator: THREE.Vector3): THREE.Vector3
	{
		var lifeDecay = this.lifeTimeLeft / this.duration;
		var timePassed = (this.duration - this.lifeTimeLeft) * this.frequency;
		var amp = noise.simplex2(this.ampRow, timePassed) * this.amplitude;
		var ang = noise.simplex2(this.angleRow, timePassed) * Math.PI * 2;
		accumulator.x += Math.cos(ang) * amp * lifeDecay;
		accumulator.y += Math.sin(ang) * amp * lifeDecay;
		return accumulator;
	}
}

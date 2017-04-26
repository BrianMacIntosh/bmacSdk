
type TweenFunction = (time : number, base : number, c : number, duration : number) => number;

class BaseTweener
{
	public timer : number = 0;

	constructor(public duration : number)
	{
		this.timer = duration;
	}

	/**
	 * Updates the timer. Returns true if it was changed.
	 */
	public update(deltaSec : number) : boolean
	{
		if (this.timer < this.duration)
		{
			this.timer = Math.min(this.duration, this.timer + deltaSec);
			return true;
		}
		else
		{
			return false;
		}
	}

	public isActive() : boolean
	{
		return this.timer < this.duration;
	}
}

export class Tweener extends BaseTweener
{
	public from : number = 0;
	public to : number = 0;

	protected func : TweenFunction;

	constructor(duration : number)
	{
		super(duration);
	}

	public start(from : number, to : number, func : TweenFunction) : void
	{
		this.from = from;
		this.to = to;
		this.timer = 0;
		this.func = func;
	}

	public getRatio() : number
	{
		return Math.clamp(this.timer / this.duration, 0, 1);
	}

	public sample() : number
	{
		return this.func(this.timer, this.from, this.getDelta(), this.duration);
	}

	public retarget(to : number) : void
	{
		this.to = to;
	}

	public getDelta() : number
	{
		return this.to - this.from;
	}
}

export class Vector2Tweener extends BaseTweener
{
	public from : THREE.Vector2 = new THREE.Vector2();
	public to : THREE.Vector2 = new THREE.Vector2();

	protected func : TweenFunction;

	constructor(duration : number)
	{
		super(duration);
	}

	public start(from : THREE.Vector2, to : THREE.Vector2, func : TweenFunction) : void
	{
		this.from.copy(from);
		this.to.copy(to);
		this.timer = 0;
		this.func = func;
	}

	public sample(buffer : THREE.Vector2) : THREE.Vector2
	{
		buffer.x = this.func(this.timer, this.from.x, this.getDeltaX(), this.duration);
		buffer.y = this.func(this.timer, this.from.y, this.getDeltaY(), this.duration);
		return buffer;
	}

	public retarget(to : THREE.Vector2) : void
	{
		this.to.copy(to);
	}

	public getDelta(vector : THREE.Vector2) : THREE.Vector2
	{
		return vector.subVectors(this.to, this.from);
	}

	public getDeltaX() : number
	{
		return this.to.x - this.from.x;
	}

	public getDeltaY() : number
	{
		return this.to.y - this.from.y;
	}
}

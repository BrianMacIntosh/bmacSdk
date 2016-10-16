
// source: http://gizma.com/easing/

interface Math
{
	// simple linear tweening - no easing, no acceleration
	linearTween(time: number, base: number, c: number, duration: number): number;

	// quadratic easing in - accelerating from zero velocity
	easeInQuad(time: number, base: number, c: number, duration: number): number;

	// quadratic easing out - decelerating to zero velocity
	easeOutQuad(time: number, base: number, c: number, duration: number): number;

	// quadratic easing in/out - acceleration until halfway, then deceleration
	easeInOutQuad(time: number, base: number, c: number, duration: number): number;

	// cubic easing in - accelerating from zero velocity
	easeInCubic(time: number, base: number, c: number, duration: number): number;

	// cubic easing out - decelerating to zero velocity
	easeOutCubic(time: number, base: number, c: number, duration: number): number;

	// cubic easing in/out - acceleration until halfway, then deceleration
	easeInOutCubic(time: number, base: number, c: number, duration: number): number;

	// quartic easing in - accelerating from zero velocity
	easeInQuart(time: number, base: number, c: number, duration: number): number;

	// quartic easing out - decelerating to zero velocity
	easeOutQuart(time: number, base: number, c: number, duration: number): number;

	// quartic easing in/out - acceleration until halfway, then deceleration
	easeInOutQuart(time: number, base: number, c: number, duration: number): number;

	// quintic easing in - accelerating from zero velocity
	easeInQuint(time: number, base: number, c: number, duration: number): number;

	// quintic easing out - decelerating to zero velocity
	easeOutQuint(time: number, base: number, c: number, duration: number): number;

	// quintic easing in/out - acceleration until halfway, then deceleration
	easeInOutQuint(time: number, base: number, c: number, duration: number): number;

	// sinusoidal easing in - accelerating from zero velocity
	easeInSine(time: number, base: number, c: number, duration: number): number;

	// sinusoidal easing out - decelerating to zero velocity
	easeOutSine(time: number, base: number, c: number, duration: number): number;

	// sinusoidal easing in/out - accelerating until halfway, then decelerating
	easeInOutSine(time: number, base: number, c: number, duration: number): number;

	// exponential easing in - accelerating from zero velocity
	easeInExpo(time: number, base: number, c: number, duration: number): number;

	// exponential easing out - decelerating to zero velocity
	easeOutExpo(time: number, base: number, c: number, duration: number): number;

	// exponential easing in/out - accelerating until halfway, then decelerating
	easeInOutExpo(time: number, base: number, c: number, duration: number): number;

	// circular easing in - accelerating from zero velocity
	easeInCirc(time: number, base: number, c: number, duration: number): number;

	// circular easing out - decelerating to zero velocity
	easeOutCirc(time: number, base: number, c: number, duration: number): number;

	// circular easing in/out - acceleration until halfway, then deceleration
	easeInOutCirc(time: number, base: number, c: number, duration: number): number;
}

// simple linear tweening - no easing, no acceleration
Math.linearTween = function(time: number, base: number, c: number, duration: number): number
{
	return c*time/duration + base;
};

// quadratic easing in - accelerating from zero velocity
Math.easeInQuad = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration;
	return c*time*time + base;
};

// quadratic easing out - decelerating to zero velocity
Math.easeOutQuad = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration;
	return -c * time*(time-2) + base;
};

// quadratic easing in/out - acceleration until halfway, then deceleration
Math.easeInOutQuad = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration/2;
	if (time < 1) return c/2*time*time + base;
	time--;
	return -c/2 * (time*(time-2) - 1) + base;
};

// cubic easing in - accelerating from zero velocity
Math.easeInCubic = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration;
	return c*time*time*time + base;
};

// cubic easing out - decelerating to zero velocity
Math.easeOutCubic = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration;
	time--;
	return c*(time*time*time + 1) + base;
};

// cubic easing in/out - acceleration until halfway, then deceleration
Math.easeInOutCubic = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration/2;
	if (time < 1) return c/2*time*time*time + base;
	time -= 2;
	return c/2*(time*time*time + 2) + base;
};

// quartic easing in - accelerating from zero velocity
Math.easeInQuart = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration;
	return c*time*time*time*time + base;
};

// quartic easing out - decelerating to zero velocity
Math.easeOutQuart = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration;
	time--;
	return -c * (time*time*time*time - 1) + base;
};

// quartic easing in/out - acceleration until halfway, then deceleration
Math.easeInOutQuart = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration/2;
	if (time < 1) return c/2*time*time*time*time + base;
	time -= 2;
	return -c/2 * (time*time*time*time - 2) + base;
};

// quintic easing in - accelerating from zero velocity
Math.easeInQuint = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration;
	return c*time*time*time*time*time + base;
};

// quintic easing out - decelerating to zero velocity
Math.easeOutQuint = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration;
	time--;
	return c*(time*time*time*time*time + 1) + base;
};

// quintic easing in/out - acceleration until halfway, then deceleration
Math.easeInOutQuint = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration/2;
	if (time < 1) return c/2*time*time*time*time*time + base;
	time -= 2;
	return c/2*(time*time*time*time*time + 2) + base;
};

// sinusoidal easing in - accelerating from zero velocity
Math.easeInSine = function(time: number, base: number, c: number, duration: number): number
{
	return -c * Math.cos(time/duration * (Math.PI/2)) + c + base;
};

// sinusoidal easing out - decelerating to zero velocity
Math.easeOutSine = function(time: number, base: number, c: number, duration: number): number
{
	return c * Math.sin(time/duration * (Math.PI/2)) + base;
};

// sinusoidal easing in/out - accelerating until halfway, then decelerating
Math.easeInOutSine = function(time: number, base: number, c: number, duration: number): number
{
	return -c/2 * (Math.cos(Math.PI*time/duration) - 1) + base;
};

// exponential easing in - accelerating from zero velocity
Math.easeInExpo = function(time: number, base: number, c: number, duration: number): number
{
	return c * Math.pow( 2, 10 * (time/duration - 1) ) + base;
};

// exponential easing out - decelerating to zero velocity
Math.easeOutExpo = function(time: number, base: number, c: number, duration: number): number
{
	return c * ( -Math.pow( 2, -10 * time/duration ) + 1 ) + base;
};

// exponential easing in/out - accelerating until halfway, then decelerating
Math.easeInOutExpo = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration/2;
	if (time < 1) return c/2 * Math.pow( 2, 10 * (time - 1) ) + base;
	time--;
	return c/2 * ( -Math.pow( 2, -10 * time) + 2 ) + base;
};

// circular easing in - accelerating from zero velocity
Math.easeInCirc = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration;
	return -c * (Math.sqrt(1 - time*time) - 1) + base;
};

// circular easing out - decelerating to zero velocity
Math.easeOutCirc = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration;
	time--;
	return c * Math.sqrt(1 - time*time) + base;
};

// circular easing in/out - acceleration until halfway, then deceleration
Math.easeInOutCirc = function(time: number, base: number, c: number, duration: number): number
{
	time /= duration/2;
	if (time < 1) return -c/2 * (Math.sqrt(1 - time*time) - 1) + base;
	time -= 2;
	return c/2 * (Math.sqrt(1 - time*time) + 1) + base;
};

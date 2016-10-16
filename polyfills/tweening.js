// source: http://gizma.com/easing/
// simple linear tweening - no easing, no acceleration
Math.linearTween = function (time, base, c, duration) {
    return c * time / duration + base;
};
// quadratic easing in - accelerating from zero velocity
Math.easeInQuad = function (time, base, c, duration) {
    time /= duration;
    return c * time * time + base;
};
// quadratic easing out - decelerating to zero velocity
Math.easeOutQuad = function (time, base, c, duration) {
    time /= duration;
    return -c * time * (time - 2) + base;
};
// quadratic easing in/out - acceleration until halfway, then deceleration
Math.easeInOutQuad = function (time, base, c, duration) {
    time /= duration / 2;
    if (time < 1)
        return c / 2 * time * time + base;
    time--;
    return -c / 2 * (time * (time - 2) - 1) + base;
};
// cubic easing in - accelerating from zero velocity
Math.easeInCubic = function (time, base, c, duration) {
    time /= duration;
    return c * time * time * time + base;
};
// cubic easing out - decelerating to zero velocity
Math.easeOutCubic = function (time, base, c, duration) {
    time /= duration;
    time--;
    return c * (time * time * time + 1) + base;
};
// cubic easing in/out - acceleration until halfway, then deceleration
Math.easeInOutCubic = function (time, base, c, duration) {
    time /= duration / 2;
    if (time < 1)
        return c / 2 * time * time * time + base;
    time -= 2;
    return c / 2 * (time * time * time + 2) + base;
};
// quartic easing in - accelerating from zero velocity
Math.easeInQuart = function (time, base, c, duration) {
    time /= duration;
    return c * time * time * time * time + base;
};
// quartic easing out - decelerating to zero velocity
Math.easeOutQuart = function (time, base, c, duration) {
    time /= duration;
    time--;
    return -c * (time * time * time * time - 1) + base;
};
// quartic easing in/out - acceleration until halfway, then deceleration
Math.easeInOutQuart = function (time, base, c, duration) {
    time /= duration / 2;
    if (time < 1)
        return c / 2 * time * time * time * time + base;
    time -= 2;
    return -c / 2 * (time * time * time * time - 2) + base;
};
// quintic easing in - accelerating from zero velocity
Math.easeInQuint = function (time, base, c, duration) {
    time /= duration;
    return c * time * time * time * time * time + base;
};
// quintic easing out - decelerating to zero velocity
Math.easeOutQuint = function (time, base, c, duration) {
    time /= duration;
    time--;
    return c * (time * time * time * time * time + 1) + base;
};
// quintic easing in/out - acceleration until halfway, then deceleration
Math.easeInOutQuint = function (time, base, c, duration) {
    time /= duration / 2;
    if (time < 1)
        return c / 2 * time * time * time * time * time + base;
    time -= 2;
    return c / 2 * (time * time * time * time * time + 2) + base;
};
// sinusoidal easing in - accelerating from zero velocity
Math.easeInSine = function (time, base, c, duration) {
    return -c * Math.cos(time / duration * (Math.PI / 2)) + c + base;
};
// sinusoidal easing out - decelerating to zero velocity
Math.easeOutSine = function (time, base, c, duration) {
    return c * Math.sin(time / duration * (Math.PI / 2)) + base;
};
// sinusoidal easing in/out - accelerating until halfway, then decelerating
Math.easeInOutSine = function (time, base, c, duration) {
    return -c / 2 * (Math.cos(Math.PI * time / duration) - 1) + base;
};
// exponential easing in - accelerating from zero velocity
Math.easeInExpo = function (time, base, c, duration) {
    return c * Math.pow(2, 10 * (time / duration - 1)) + base;
};
// exponential easing out - decelerating to zero velocity
Math.easeOutExpo = function (time, base, c, duration) {
    return c * (-Math.pow(2, -10 * time / duration) + 1) + base;
};
// exponential easing in/out - accelerating until halfway, then decelerating
Math.easeInOutExpo = function (time, base, c, duration) {
    time /= duration / 2;
    if (time < 1)
        return c / 2 * Math.pow(2, 10 * (time - 1)) + base;
    time--;
    return c / 2 * (-Math.pow(2, -10 * time) + 2) + base;
};
// circular easing in - accelerating from zero velocity
Math.easeInCirc = function (time, base, c, duration) {
    time /= duration;
    return -c * (Math.sqrt(1 - time * time) - 1) + base;
};
// circular easing out - decelerating to zero velocity
Math.easeOutCirc = function (time, base, c, duration) {
    time /= duration;
    time--;
    return c * Math.sqrt(1 - time * time) + base;
};
// circular easing in/out - acceleration until halfway, then deceleration
Math.easeInOutCirc = function (time, base, c, duration) {
    time /= duration / 2;
    if (time < 1)
        return -c / 2 * (Math.sqrt(1 - time * time) - 1) + base;
    time -= 2;
    return c / 2 * (Math.sqrt(1 - time * time) + 1) + base;
};

Math.sign = Math.sign || function (val) {
    if (isNaN(val - 0))
        return NaN;
    else if (val < 0)
        return -1;
    else if (val > 0)
        return 1;
    else
        return 0;
};
Math.clamp = Math.clamp || function (val, a, b) {
    if (val < a)
        return a;
    if (val > b)
        return b;
    return val;
};
Math.randomInt = Math.randomInt || function (upperBoundExclusive) {
    return Math.floor(Math.random() * upperBoundExclusive);
};
Math.randomRange = Math.randomRange || function (minInclusive, maxExclusive) {
    return Math.randomInt(maxExclusive - minInclusive) + minInclusive;
};
/**
 * Converts the specified angle in radians to degrees.
 * @param {number} rad
 */
Math.rad2Deg = Math.rad2Deg || function (rad) {
    return (rad / Math.PI) * 180;
};
/**
 * Converts the specified angle in degrees to radians.
 * @param {number} deg
 */
Math.deg2Rad = Math.deg2Rad || function (deg) {
    return (deg / 180) * Math.PI;
};
//Robert Eisele
Math.isAngleBetween = function (n, a, b) {
    var circle = Math.PI * 2;
    n = (circle + (n % circle)) % circle;
    a = (circle * 100 + a) % circle;
    b = (circle * 100 + b) % circle;
    if (a < b)
        return a <= n && n <= b;
    return a <= n || n <= b;
};
Math.angleDifference = function (a, b) {
    return Math.unsignedMod(a - b + Math.PI * 3, Math.PI * 2) - Math.PI;
};
Math.unsignedMod = function (n, base) {
    n = Math.abs(n);
    base = Math.abs(base);
    return n - Math.floor(n / base) * base;
};
Math.approximatelyEqual = function (a, b) {
    return Math.abs(a - b) < 0.0000000000000003; //~2^-52 (2x10^-16)
};

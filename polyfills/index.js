require("./tweening");
Math.sign = Math.sign || function (val) {
    if (val < 0)
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
    return Math.unsignedMod(b - a + Math.PI, Math.PI * 2) - Math.PI;
};
Math.unsignedMod = function (n, base) {
    return n - Math.floor(n / base) * base;
};
String.prototype.trim = String.prototype.trim || function trim() {
    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};
String.prototype.trimStart = String.prototype.trimStart || function trimStart() {
    return this.replace(/^\s\s*/, '');
};
String.prototype.trimEnd = String.prototype.trimEnd || function trimEnd() {
    return this.replace(/\s\s*$/, '');
};
String.prototype.djb2Hash = String.prototype.djb2Hash || function djb2Hash() {
    var hash = 5381;
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
        hash = hash & hash; //force to 32-bit int (thanks JS)
    }
    return hash;
};
Array.prototype.remove = Array.prototype.remove || function remove(object) {
    for (var c = 0; c < this.length; c++) {
        if (this[c] === object) {
            this.splice(c, 1);
            return true;
        }
    }
    return false;
};
Array.prototype.contains = Array.prototype.contains || function contains(object) {
    for (var c = 0; c < this.length; c++) {
        if (this[c] === object) {
            return true;
        }
    }
    return false;
};
Array.prototype.addInFirstSpace = function addInFirstSpace(object, min) {
    for (var c = min; c < this.length; c++) {
        if (this[c] === undefined || this[c] === null) {
            this[c] = object;
            return c;
        }
    }
    var index = Math.max(min, this.length);
    this[index] = object;
    return index;
};

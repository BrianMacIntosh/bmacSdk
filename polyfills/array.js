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
Array.prototype.addRange = function addRange(other) {
    var len = other.length;
    for (var i = 0; i < len; i++) {
        this.push(other[i]);
    }
};
Array.isArray = Array.isArray || function isArray(arg) {
    return arg instanceof Array;
};

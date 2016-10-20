require("./tweening");
require("./math");
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
String.prototype.endsWith = String.prototype.endsWith || function (searchString, position) {
    var subjectString = this.toString();
    if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
    }
    position -= searchString.length;
    var lastIndex = subjectString.lastIndexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
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

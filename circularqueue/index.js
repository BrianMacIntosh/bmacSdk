"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CircularQueue = (function () {
    function CircularQueue(length) {
        this.head = 0;
        this.tail = -1;
        this.data = [];
        this.data.length = length;
    }
    ;
    CircularQueue.prototype.getLength = function () {
        //TODO: is wrong when head and tail meet (overflow)
        return this.tail - this.head + 1;
    };
    ;
    /// Wrap an index so it falls in [0, length)
    /// ASSUMES index is is not less than -2*length
    CircularQueue.prototype.wrapIndex = function (index) {
        return (index + 2 * this.data.length) % this.data.length;
    };
    ;
    /**
     * Push a new element at 'tail'
     */
    CircularQueue.prototype.push = function (obj) {
        var wasValid = this.valid();
        // add at tail
        this.tail = this.wrapIndex(this.tail + 1);
        this.data[this.tail] = obj;
        // we overwrote an existing element, tail pushes the head forward
        if (wasValid && this.tail == this.head) {
            this.head = this.wrapIndex(this.tail + 1);
        }
    };
    ;
    /**
     * Remove all elements in range [head, index]
     */
    CircularQueue.prototype.truncateTo = function (index) {
        for (var i = this.head;; i = this.wrapIndex(i + 1)) {
            this.data[i] = null;
            if (i == index)
                break;
        }
        if (index == this.tail) {
            this.head = 0;
            this.tail = -1;
        }
        else {
            this.head = this.wrapIndex(index + 1);
        }
    };
    ;
    CircularQueue.prototype.valid = function () {
        return this.tail >= 0 && this.head >= 0;
    };
    return CircularQueue;
}());
exports.CircularQueue = CircularQueue;

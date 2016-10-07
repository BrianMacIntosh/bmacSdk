"use strict";
var Encoding = require("text-encoding");
var DataViewStream = (function () {
    function DataViewStream(sizeOrBuffer) {
        //TODO: profile DataView against TypedArrays
        if (!sizeOrBuffer) {
            this.buffer = new ArrayBuffer(64);
        }
        if (sizeOrBuffer instanceof ArrayBuffer) {
            this.buffer = sizeOrBuffer;
        }
        else if (sizeOrBuffer instanceof Buffer) {
            var newBuffer = new ArrayBuffer(sizeOrBuffer.length);
            var byteView = new Uint8Array(newBuffer);
            for (var i = 0; i < sizeOrBuffer.length; ++i)
                byteView[i] = sizeOrBuffer[i];
            this.buffer = newBuffer;
        }
        else {
            this.buffer = new ArrayBuffer(sizeOrBuffer);
        }
        this.dataView = new DataView(this.buffer);
        this.pointer = 0;
        this.bitBuffer = 0;
        this.bitBufferPointer = -1;
        this.stringEncoder = new Encoding.TextEncoder("utf-8");
        this.stringDecoder = new Encoding.TextDecoder("utf-8");
    }
    /**
     * Trim the buffer and return it.
     */
    DataViewStream.prototype.getSendBuffer = function () {
        this._tryWriteBitBuffer();
        if (this.pointer < this.buffer.byteLength) {
            this.resize(this.pointer);
        }
        return this.buffer;
    };
    DataViewStream.prototype.isEmpty = function () {
        //HACK: not true for reads
        return this.pointer == 0;
    };
    DataViewStream.prototype.resize = function (newSize) {
        var newBuffer = new ArrayBuffer(newSize);
        var byteView = new Uint8Array(this.buffer);
        var newByteView = new Uint8Array(newBuffer);
        var minSize = Math.min(newSize, this.buffer.byteLength);
        for (var i = 0; i < minSize; i++)
            newByteView[i] = byteView[i];
        this.buffer = newBuffer;
        this.dataView = new DataView(this.buffer);
    };
    DataViewStream.prototype.getBit = function () {
        if (this.bitBufferPointer < 0) {
            this.bitBuffer = this.getUint8();
            this.bitBufferPointer = 0;
        }
        var data = ((1 << this.bitBufferPointer) & this.bitBuffer) !== 0;
        this.bitBufferPointer++;
        if (this.bitBufferPointer >= 8) {
            this.bitBuffer = 0;
            this.bitBufferPointer = -1;
        }
        return data;
    };
    /**
     * Call before a read operation.
     */
    DataViewStream.prototype._startRead = function () {
        // clear the last bit buffer, if any
        if (this.bitBufferPointer >= 0) {
            this.bitBuffer = 0;
            this.bitBufferPointer = -1;
        }
    };
    DataViewStream.prototype.getInt8 = function () {
        this._startRead();
        var data = this.dataView.getInt8(this.pointer);
        this.pointer += 1;
        return data;
    };
    DataViewStream.prototype.getUint8 = function () {
        this._startRead();
        var data = this.dataView.getUint8(this.pointer);
        this.pointer += 1;
        return data;
    };
    DataViewStream.prototype.getInt16 = function () {
        this._startRead();
        var data = this.dataView.getInt16(this.pointer);
        this.pointer += 2;
        return data;
    };
    DataViewStream.prototype.getUint16 = function () {
        this._startRead();
        var data = this.dataView.getUint16(this.pointer);
        this.pointer += 2;
        return data;
    };
    DataViewStream.prototype.getInt32 = function () {
        this._startRead();
        var data = this.dataView.getInt32(this.pointer);
        this.pointer += 4;
        return data;
    };
    DataViewStream.prototype.getUint32 = function () {
        this._startRead();
        var data = this.dataView.getUint32(this.pointer);
        this.pointer += 4;
        return data;
    };
    DataViewStream.prototype.getFloat32 = function () {
        this._startRead();
        var data = this.dataView.getFloat32(this.pointer);
        this.pointer += 4;
        return data;
    };
    DataViewStream.prototype.getFloat64 = function () {
        this._startRead();
        var data = this.dataView.getFloat64(this.pointer);
        this.pointer += 8;
        return data;
    };
    DataViewStream.prototype.getString = function () {
        var length = this.getUint32();
        var byteArray = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
            byteArray[i] = this.getUint8();
        }
        return this.stringDecoder.decode(byteArray);
    };
    DataViewStream.prototype.setBit = function (value) {
        if (this.bitBufferPointer < 0) {
            this.bitBufferPointer = 0;
            this.bitBuffer = 0;
        }
        if (value) {
            this.bitBuffer = (this.bitBuffer | (1 << this.bitBufferPointer));
        }
        this.bitBufferPointer++;
        if (this.bitBufferPointer >= 8) {
            this._tryWriteBitBuffer();
        }
    };
    /**
     * Call before a write operation.
     * @param {Number} size The size of the data you will write.
     */
    DataViewStream.prototype._startWrite = function (size) {
        this._tryWriteBitBuffer();
        // make sure there is enough size
        if (this.buffer.byteLength < this.pointer + size) {
            this.resize(Math.max(this.buffer.byteLength * 2, this.pointer + size));
        }
    };
    DataViewStream.prototype._tryWriteBitBuffer = function () {
        if (this.bitBufferPointer >= 0) {
            this.bitBufferPointer = -1;
            this.setUint8(this.bitBuffer);
            this.bitBuffer = 0;
        }
    };
    DataViewStream.prototype.setInt8 = function (value) {
        this._startWrite(1);
        this.dataView.setInt8(this.pointer, value);
        this.pointer += 1;
    };
    DataViewStream.prototype.setUint8 = function (value) {
        this._startWrite(1);
        this.dataView.setUint8(this.pointer, value);
        this.pointer += 1;
    };
    DataViewStream.prototype.setInt16 = function (value) {
        this._startWrite(2);
        this.dataView.setInt16(this.pointer, value);
        this.pointer += 2;
    };
    DataViewStream.prototype.setUint16 = function (value) {
        this._startWrite(2);
        this.dataView.setUint16(this.pointer, value);
        this.pointer += 2;
    };
    DataViewStream.prototype.setInt32 = function (value) {
        this._startWrite(4);
        this.dataView.setInt32(this.pointer, value);
        this.pointer += 4;
    };
    DataViewStream.prototype.setUint32 = function (value) {
        this._startWrite(4);
        this.dataView.setUint32(this.pointer, value);
        this.pointer += 4;
    };
    DataViewStream.prototype.setFloat32 = function (value) {
        this._startWrite(4);
        this.dataView.setFloat32(this.pointer, value);
        this.pointer += 4;
    };
    DataViewStream.prototype.setFloat64 = function (value) {
        this._startWrite(8);
        this.dataView.setFloat64(this.pointer, value);
        this.pointer += 8;
    };
    DataViewStream.prototype.setString = function (value) {
        this.setUint32(value.length);
        var byteArray = this.stringEncoder.encode(value);
        for (var i = 0; i < byteArray.length; i++) {
            this.setUint8(byteArray[i]);
        }
    };
    return DataViewStream;
}());
exports.DataViewStream = DataViewStream;

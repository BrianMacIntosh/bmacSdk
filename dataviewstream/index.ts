
import Encoding = require("text-encoding");

export class DataViewStream
{
	buffer: ArrayBuffer;
	dataView: DataView;
	pointer: number;
	bitBuffer: number;
	bitBufferPointer: number;
	
	stringEncoder: Encoding.TextEncoder;
	stringDecoder: Encoding.TextDecoder;

	constructor(sizeOrBuffer)
	{
		//TODO: profile DataView against TypedArrays

		if (!sizeOrBuffer)
		{
			this.buffer = new ArrayBuffer(64);
		}
		if (sizeOrBuffer instanceof ArrayBuffer)
		{
			this.buffer = sizeOrBuffer;
		}
		else if (sizeOrBuffer instanceof Buffer)
		{
			var newBuffer = new ArrayBuffer(sizeOrBuffer.length);
			var byteView = new Uint8Array(newBuffer);
			for (var i = 0; i < sizeOrBuffer.length; ++i) byteView[i] = sizeOrBuffer[i];
			this.buffer = newBuffer;
		}
		else
		{
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
	public getSendBuffer(): ArrayBuffer
	{
		this._tryWriteBitBuffer();
		if (this.pointer < this.buffer.byteLength)
		{
			this.resize(this.pointer);
		}
		return this.buffer;
	}

	public isEmpty(): boolean
	{
		//HACK: not true for reads
		return this.pointer == 0;
	}

	public resize(newSize: number): void
	{
		var newBuffer = new ArrayBuffer(newSize);
		var byteView = new Uint8Array(this.buffer);
		var newByteView = new Uint8Array(newBuffer);
		var minSize = Math.min(newSize, this.buffer.byteLength);
		for (var i = 0; i < minSize; i++) newByteView[i] = byteView[i];
		this.buffer = newBuffer;
		this.dataView = new DataView(this.buffer);
	}


	public getBit(): boolean
	{
		if (this.bitBufferPointer < 0)
		{
			this.bitBuffer = this.getUint8();
			this.bitBufferPointer = 0;
		}

		var data = ((1 << this.bitBufferPointer) & this.bitBuffer) !== 0;
		this.bitBufferPointer++;
		if (this.bitBufferPointer >= 8)
		{
			this.bitBuffer = 0;
			this.bitBufferPointer = -1;
		}

		return data;
	}

	/**
	 * Call before a read operation.
	 */
	public _startRead(): void
	{
		// clear the last bit buffer, if any
		if (this.bitBufferPointer >= 0)
		{
			this.bitBuffer = 0;
			this.bitBufferPointer = -1;
		}
	}

	public getInt8(): number
	{
		this._startRead();
		var data = this.dataView.getInt8(this.pointer);
		this.pointer += 1;
		return data;
	}

	public getUint8(): number
	{
		this._startRead();
		var data = this.dataView.getUint8(this.pointer);
		this.pointer += 1;
		return data;
	}

	public getInt16(): number
	{
		this._startRead();
		var data = this.dataView.getInt16(this.pointer);
		this.pointer += 2;
		return data;
	}

	public getUint16(): number
	{
		this._startRead();
		var data = this.dataView.getUint16(this.pointer);
		this.pointer += 2;
		return data;
	}

	public getInt32(): number
	{
		this._startRead();
		var data = this.dataView.getInt32(this.pointer);
		this.pointer += 4;
		return data;
	}

	public getUint32(): number
	{
		this._startRead();
		var data = this.dataView.getUint32(this.pointer);
		this.pointer += 4;
		return data;
	}

	public getFloat32(): number
	{
		this._startRead();
		var data = this.dataView.getFloat32(this.pointer);
		this.pointer += 4;
		return data;
	}

	public getFloat64(): number
	{
		this._startRead();
		var data = this.dataView.getFloat64(this.pointer);
		this.pointer += 8;
		return data;
	}

	public getString(): string
	{
		var length = this.getUint32();
		if (length == 0) return "";
		
		var byteArray = new Uint8Array(length);
		for (var i = 0; i < length; i++)
		{
			byteArray[i] = this.getUint8();
		}
		return this.stringDecoder.decode(byteArray);
	}


	public setBit(value: boolean): void
	{
		if (this.bitBufferPointer < 0)
		{
			this.bitBufferPointer = 0;
			this.bitBuffer = 0;
		}

		if (value)
		{
			this.bitBuffer = (this.bitBuffer | (1 << this.bitBufferPointer));
		}
		this.bitBufferPointer++;
		if (this.bitBufferPointer >= 8)
		{
			this._tryWriteBitBuffer();
		}
	}

	/**
	 * Call before a write operation.
	 * @param {Number} size The size of the data you will write.
	 */
	public _startWrite(size: number): void
	{
		this._tryWriteBitBuffer();

		// make sure there is enough size
		if (this.buffer.byteLength < this.pointer + size)
		{
			this.resize(Math.max(this.buffer.byteLength * 2, this.pointer + size));
		}
	}

	public _tryWriteBitBuffer(): void
	{
		if (this.bitBufferPointer >= 0)
		{
			this.bitBufferPointer = -1;
			this.setUint8(this.bitBuffer);
			this.bitBuffer = 0;
		}
	}

	public setInt8(value: number): void
	{
		this._startWrite(1);
		this.dataView.setInt8(this.pointer, value);
		this.pointer += 1;
	}

	public setUint8(value: number): void
	{
		this._startWrite(1);
		this.dataView.setUint8(this.pointer, value);
		this.pointer += 1;
	}

	public setInt16(value: number): void
	{
		this._startWrite(2);
		this.dataView.setInt16(this.pointer, value);
		this.pointer += 2;
	}

	public setUint16(value: number): void
	{
		this._startWrite(2);
		this.dataView.setUint16(this.pointer, value);
		this.pointer += 2;
	}

	public setInt32(value: number): void
	{
		this._startWrite(4);
		this.dataView.setInt32(this.pointer, value);
		this.pointer += 4;
	}

	public setUint32(value: number): void
	{
		this._startWrite(4);
		this.dataView.setUint32(this.pointer, value);
		this.pointer += 4;
	}

	public setFloat32(value: number): void
	{
		this._startWrite(4);
		this.dataView.setFloat32(this.pointer, value);
		this.pointer += 4;
	}

	public setFloat64(value: number): void
	{
		this._startWrite(8);
		this.dataView.setFloat64(this.pointer, value);
		this.pointer += 8;
	}

	public setString(value: string): void
	{
		this.setUint32(value.length);
		var byteArray = this.stringEncoder.encode(value);
		for (var i = 0; i < byteArray.length; i++)
		{
			this.setUint8(byteArray[i]);
		}
	}
}

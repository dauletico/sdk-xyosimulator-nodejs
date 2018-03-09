/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, March 2, 2018 1:07 AM
 * @Email:  developer@xyfindables.com
 * @Filename: CryptoByteBuffer.js
 * @Last modified by:   arietrouw
 * @Last modified time: Thursday, March 8, 2018 6:48 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const debug = require(`debug`)(`CryptoByteBuffer`);
const ByteBuffer = require(`bytebuffer`);
const bigInt = require(`big-integer`);

class CryptoByteBuffer extends ByteBuffer {
  writeUInt256(value) {
    debug(`writeUInt256: `, this.offset);
    let bi = bigInt(value);

    if (bi.lesser(`0`)) {
      bi = 0;
    } else if (bi.greater(bigInt(`0x1`).shiftLeft(256))) {
      bi = bigInt(`0x1`).shiftLeft(256).minus(1);
    }

    let strBuf = bi.toString(16);
    while (strBuf.length < 64) {
      strBuf = `0${strBuf}`;
    }

    this.append(ByteBuffer.fromHex(strBuf));
  }

  writeInt256(value) {
    debug(`writeInt256: `, this.offset);
    let bi = bigInt(value);

    if (bi.lesser(bigInt(`0x1`).shiftLeft(255).not())) {
      bi = bigInt(`0x1`).shiftLeft(255).not().plus(1);
    } else if (bi.greater(bigInt(`0x1`).shiftLeft(255))) {
      bi = bigInt(`0x1`).shiftLeft(255).minus(1);
    }
    let strBuf = bi.toString(16);
    while (strBuf.length < 64) {
      strBuf = `0${strBuf}`;
    }
    this.append(ByteBuffer.fromHex(strBuf));
  }

  readUInt256() {
    debug(`readUInt256: `, this.offset);
    const result = bigInt(this.toString(`hex`, this.offset, this.offset + 32), 16);
    this.offset += 32;
    return result;
  }

  readInt256() {
    debug(`readUInt256: `, this.offset);
    const result = bigInt(this.toString(`hex`, this.offset, this.offset + 32), 16);
    this.offset += 32;
    return result;
  }

  writeBufferArray(array) {
    debug(`writeBufferArray: `, this.offset, `, `, array.length);
    this.writeUInt16(array.length);
    for (let i = 0; i < array.length; i++) {
      debug(`writeBufferArray[${i}]`);
      this.writeBuffer(array[i]);
    }
  }

  readBufferArray() {
    debug(`readBufferArray: `, this.offset);
    const result = [];
    debug(`readBufferArray: `, this.offset);
    const length = this.readUInt16();
    debug(`readBufferArray: `, this.offset);
    for (let i = 0; i < length; i++) {
      debug(`readBufferArray[${i}]: `, this.offset);
      result.push(this.readBuffer());
    }
    return result;
  }

  writeBuffer(_buffer) {
    const buffer = CryptoByteBuffer.wrap(_buffer);
    buffer.offset = 0;
    debug(`writeBuffer: `, this.offset, `, `, buffer.getLength(), `, `, buffer.offset);
    this.writeUInt16(buffer.getLength());

    for (let i = 0; i < buffer.getLength(); i++) {
      this.writeUInt8(buffer.readUInt8());
    }
  }

  readBuffer() {
    debug(`readBuffer: `, this.offset);
    const length = this.readUInt16();
    debug(`readBuffer: `, length);
    const buffer = this.slice(this.offset, this.offset + length);
    this.offset += length;
    return buffer;
  }

  getLength() {
    return this.buffer.length;
  }
}

debug(`load`);

ByteBuffer.prototype = CryptoByteBuffer.prototype;

module.exports = ByteBuffer;

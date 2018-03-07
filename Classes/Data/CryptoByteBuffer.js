/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, March 2, 2018 1:07 AM
 * @Email:  developer@xyfindables.com
 * @Filename: CryptoByteBuffer.js
 * @Last modified by:   arietrouw
 * @Last modified time: Tuesday, March 6, 2018 4:50 PM
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

    this.append(Buffer.from(strBuf, `hex`, 32));
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
    this.append(Buffer.from(strBuf, `hex`, 32));
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
      this.writeBuffer(array[i]);
    }
  }

  readBufferArray() {
    debug(`readBufferArray: `, this.offset);
    const result = [];
    const length = this.readUInt16();
    for (let i = 0; i < length; i++) {
      result.push(this.readBuffer());
    }
    return result;
  }

  writeBuffer(array) {
    debug(`writeBuffer: `, this.offset, `, `, array.length);
    this.writeUInt16(array.length);
    this.append(array);
  }

  readBuffer() {
    debug(`readBuffer: `, this.offset);
    const length = this.readUInt16();
    const buffer = this.slice(this.offset, this.offset + length);
    this.offset += length;
    return buffer;
  }
}

CryptoByteBuffer.wrap = (buffer, encoding, littleEndian, noAssert) => {
  const bb = ByteBuffer.wrap(buffer, encoding, littleEndian, noAssert);
  const cbb = new CryptoByteBuffer(0, littleEndian, noAssert);

  cbb.buffer = bb.buffer;
  cbb.offset = 0;
  cbb.limit = bb.byteLength;

  return cbb;
};

debug(`load`);

module.exports = CryptoByteBuffer;

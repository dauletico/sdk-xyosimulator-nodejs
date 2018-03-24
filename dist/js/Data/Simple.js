/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 6, 2018 10:07 AM
 * @Email:  developer@xyfindables.com
 * @Filename: Simple.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 23, 2018 11:24 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const Base = require(`../Base`);
const debug = require(`debug`)(`Simple`);
const CryptoByteBuffer = require(`./CryptoByteBuffer`);

/* Types */
/* =============
0x1001 = Simple
0x1002 = Proximity
0x1003 = Id
0x1004 = Location
0x1005 = Entry
0x1006 = Simple

================ */

class Simple extends Base {
  constructor(buffer) {
    super();
    this.type = 0x1001;
    if (buffer) {
      this.fromBuffer(buffer);
    }
  }

  toBuffer() {
    const buffer = new CryptoByteBuffer(16, false);

    buffer.writeUInt16(this.type);
    return buffer;
  }

  static registerClass(typeId, constructFunc) {
    if (Simple.classMap[typeId]) {
      throw new Error(`Duplicate Class Id`);
    }
    Simple.classMap[typeId] = constructFunc;
  }

  static fromBuffer(buffer) {
    const byteBuffer = CryptoByteBuffer.wrap(buffer);
    byteBuffer.clear();

    const type = byteBuffer.readUInt16();

    if (!Simple.classMap[type]) {
      throw new Error(`Unknown Class: ${type}`);
    }

    return new Simple.classMap[type](byteBuffer);
  }

  fromBuffer(byteBuffer) {
    byteBuffer.clear();
    this.type = byteBuffer.readUInt16();
    return this;
  }
}

Simple.classMap = {};
Simple.classMap[0x1001] = Simple;

debug(`load`);

module.exports = Simple;

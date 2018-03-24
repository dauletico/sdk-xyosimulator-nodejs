/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 13, 2018 2:25 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Proximity.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 23, 2018 11:25 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const debug = require(`debug`)(`Proximity`);
const Simple = require(`./Simple`);
const CryptoByteBuffer = require(`./CryptoByteBuffer`);
const BigInteger = require(`biginteger.js`);

class Proximity extends Simple {
  constructor(buffer) {
    debug(`constructor`);
    super(buffer);
    this.type = 0x1002;
    this.range = BigInteger(10000000000000000); // 16 places (meters)
  }

  toBuffer() {
    const buffer = super.toBuffer();

    buffer.writeUInt256(this.range);
    return buffer;
  }

  fromBuffer(buffer) {
    const byteBuffer = CryptoByteBuffer.wrap(buffer);

    super.fromBuffer(byteBuffer);
    this.range = byteBuffer.readUInt256();
    return this;
  }
}

debug(`load`);

Simple.classMap[0x1002] = Proximity;

module.exports = Proximity;

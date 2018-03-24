/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 13, 2018 2:25 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Id.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 23, 2018 11:25 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const debug = require(`debug`)(`Id`);
const Simple = require(`./Simple`);
const CryptoByteBuffer = require(`./CryptoByteBuffer`);
const BigInteger = require(`biginteger.js`);

class Id extends Simple {
  constructor(buffer) {
    debug(`constructor`);
    super(buffer);
    this.type = 0x1003;
    this.id = BigInteger(`0`);
  }

  toBuffer() {
    const buffer = super.toBuffer();

    buffer.writeUInt256(this.id);
    return buffer;
  }

  fromBuffer(buffer) {
    const byteBuffer = CryptoByteBuffer.wrap(buffer);

    super.fromBuffer(byteBuffer);
    this.id = buffer.writeUInt256();
    return this;
  }
}

debug(`load`);

Simple.classMap[0x1003] = Id;

module.exports = Id;

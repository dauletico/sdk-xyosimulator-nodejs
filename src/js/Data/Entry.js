/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 5:05 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Entry.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 23, 2018 11:26 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const debug = require(`debug`)(`Entry`);
const Simple = require(`./Simple.js`);
const CryptoByteBuffer = require(`./CryptoByteBuffer`);
const BigInteger = require(`biginteger.js`);

class Entry extends Simple {
  constructor(buffer) {
    // debug("constructor");
    super(buffer);
    this.type = 0x1005;
    this.payloads = [];
    this.nonce = BigInteger.randBetween(BigInteger(`0x0`), BigInteger(`0x1`).shiftedBy(31));
    this.difficulty = 0;
    this.epoch = 0;
    this.p1keys = [];
    this.p2keys = [];

    this.p1signatures = [];

    this.p2signatures = [];

    this.headKeys = [];
    this.tailKeys = [];

    this.headSignatures = [];
    this.tailSignatures = [];
  }

  p1Sign(signer, callback) {
    debug(`p1Sign`);
    const buffer = this.toBuffer();

    if (this.p2keys.length === 0) {
      throw new Error(`Missing p2 Keys`);
    }

    const result = signer(buffer);
    this.p1keys = result.keys;
    this.p1signatures = result.signatures;
    if (callback) {
      callback(this);
    }
  }

  p2Sign(signer, callback) {
    debug(`p2Sign`);
    const buffer = this.toBuffer();

    if (this.p1keys.length === 0) {
      throw new Error(`Missing p1 Keys - They are required for a p2Sign`);
    }

    if (this.p1signatures.length === 0) {
      throw new Error(`Missing p1 Signatures - They are required for a p2Sign`);
    }

    if (this.p2keys.length === 0) {
      throw new Error(`Missing p2 Keys - They are required for a p2Sign`);
    }

    const result = signer(buffer);

    this.p2signatures = result.signatures;
    if (callback) {
      callback(this);
    }
  }

  toBuffer() {
    const buffer = super.toBuffer();
    buffer.writeBufferArray(this.payloads);
    buffer.writeUInt32(this.epoch);
    buffer.writeUInt256(this.nonce);
    buffer.writeBufferArray(this.p1keys);
    buffer.writeBufferArray(this.p2keys);
    buffer.writeBufferArray(this.p2signatures);
    buffer.writeBufferArray(this.p1signatures);
    buffer.writeBufferArray(this.headKeys);
    buffer.writeBufferArray(this.tailKeys);
    buffer.writeBufferArray(this.headSignatures);
    buffer.writeBufferArray(this.tailSignatures);
    return buffer;
  }

  fromBuffer(buffer) {
    const byteBuffer = CryptoByteBuffer.wrap(buffer);

    super.fromBuffer(byteBuffer);

    this.payloads = byteBuffer.readBufferArray();
    this.epoch = byteBuffer.readUInt32();
    this.nonce = byteBuffer.readUInt256();
    this.p1keys = byteBuffer.readBufferArray();
    this.p2keys = byteBuffer.readBufferArray();
    this.p2signatures = byteBuffer.readBufferArray();
    this.p1signatures = byteBuffer.readBufferArray();
    this.headKeys = byteBuffer.readBufferArray();
    this.tailKeys = byteBuffer.readBufferArray();
    this.headSignatures = byteBuffer.readBufferArray();
    this.tailSignatures = byteBuffer.readBufferArray();

    return this;
  }
}

debug(`load`);

Simple.classMap[0x1005] = Entry;

module.exports = Entry;

/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 13, 2018 2:25 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Location.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 23, 2018 11:25 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const debug = require(`debug`)(`Location`);
const Simple = require(`./Simple`);
const CryptoByteBuffer = require(`./CryptoByteBuffer`);
const BigInteger = require(`biginteger.js`);

class Location extends Simple {
  constructor(buffer) {
    debug(`constructor`);
    super(buffer);
    this.type = 0x1004;
    this.latitude = BigInteger(`32757696800000000000`); // 24 places
    this.longitude = BigInteger(`-117149095600000000000`); // 24 places
    this.altitude = BigInteger(`15000000000000000000`); // 16 places (meters)
  }

  init(_latitude, _longitude, _altitude) {
    const latitude = _latitude || 0;
    const longitude = _longitude || 0;
    const altitude = _altitude || 0;
    this.latitude = BigInteger(latitude);
    this.latitude = BigInteger(longitude);
    this.latitude = BigInteger(altitude);
  }

  toBuffer() {
    const buffer = super.toBuffer();

    buffer.writeInt256(this.latitude);
    buffer.writeInt256(this.longitude);
    buffer.writeInt256(this.altitude);
    return buffer;
  }

  fromBuffer(buffer) {
    const byteBuffer = CryptoByteBuffer.wrap(buffer);

    super.fromBuffer(byteBuffer);
    this.latitude = buffer.readInt256();
    this.longitude = buffer.readInt256();
    this.altitude = buffer.readInt256();
    return this;
  }
}

debug(`load`);

Simple.classMap[0x1004] = Location;

module.exports = Location;

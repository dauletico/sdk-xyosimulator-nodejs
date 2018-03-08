/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 13, 2018 2:25 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Location.js
 * @Last modified by:   arietrouw
 * @Last modified time: Wednesday, March 7, 2018 8:53 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const debug = require(`debug`)(`Location`);
const Simple = require(`./Simple.js`);
const CryptoByteBuffer = require(`./CryptoByteBuffer.js`);
const bigInt = require(`big-integer`);

class Location extends Simple {
  constructor(buffer) {
    debug(`constructor`);
    super(buffer);
    this.type = 0x1004;
    this.latitude = bigInt(`32757696800000000000`); // 24 places
    this.longitude = bigInt(`-117149095600000000000`); // 24 places
    this.altitude = bigInt(`15000000000000000000`); // 16 places (meters)
  }

  init(_latitude, _longitude, _altitude) {
    const latitude = _latitude || 0;
    const longitude = _longitude || 0;
    const altitude = _altitude || 0;
    this.latitude = bigInt(latitude);
    this.latitude = bigInt(longitude);
    this.latitude = bigInt(altitude);
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

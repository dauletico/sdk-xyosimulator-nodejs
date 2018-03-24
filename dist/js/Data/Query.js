/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Monday, February 26, 2018 7:00 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Query.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 23, 2018 11:24 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const debug = require(`debug`)(`Query`);
const Simple = require(`./Simple`);
const CryptoByteBuffer = require(`./CryptoByteBuffer`);

class Query extends Simple {
  constructor(buffer) {
    debug(`constructor`);
    super(buffer);
    this.type = 0x1006;
    this.target = new CryptoByteBuffer();
    this.bounty = 0;
    this.epoch = 0;
    this.accuracy = 0;
    this.certainty = 0;
    this.delay = 0;
    this.etherGas = 0;
  }

  toBuffer() {
    const buffer = super.toBuffer();

    return buffer;
  }

  fromBuffer(buffer) {
    const byteBuffer = CryptoByteBuffer.wrap(buffer);

    super.fromBuffer(byteBuffer);
    return this;
  }
}

Query.fromArray = (array) => {
  const query = new Query();

  query.bounty = array[0];
  query.address = array[1];
  query.accuracy = array[2];
  query.certainty = array[3];
  query.delay = array[4];
  query.epoch = array[5];

  return query;
};

debug(`load`);

Simple.classMap[0x1006] = Query;

module.exports = Query;

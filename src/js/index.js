/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, March 23, 2018 10:54 PM
 * @Email:  developer@xyfindables.com
 * @Filename: index.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 23, 2018 11:05 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

const Archivist = require(`./Components/Archivist`);
const Bridge = require(`./Components/Bridge`);
const Diviner = require(`./Components/Diviner`);
const Node = require(`./Components/Node`);
const Sentinel = require(`./Components/Sentinel`);
const CryptoByteBuffer = require(`./Data/CryptoByteBuffer`);
const Entry = require(`./Data/Entry`);
const Id = require(`./Data/Id`);
const Location = require(`./Data/Location`);
const Proximity = require(`./Data/Proximity`);
const Query = require(`./Data/Query`);
const Simple = require(`./Data/Simple`);
const Base = require(`./Base`);

module.exports = {
  Component: {
    Archivist,
    Bridge,
    Diviner,
    Node,
    Sentinel,
  },
  Data: {
    CryptoByteBuffer,
    Entry,
    Id,
    Location,
    Proximity,
    Query,
    Simple,
  },
  Base,
};

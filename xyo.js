/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Sunday, March 4, 2018 2:34 PM
 * @Email:  developer@xyfindables.com
 * @Filename: xyo.js
 * @Last modified by:   arietrouw
 * @Last modified time: Sunday, March 4, 2018 6:23 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

'use strict';
const debug = require('debug')('xyo-node'),
  Archivist = require('./Classes/Components/Archivist.js'),
  Bridge = require('./Classes/Components/Bridge.js'),
  Diviner = require('./Classes/Components/Diviner.js'),
  Node = require('./Classes/Components/Node.js'),
  Sentinel = require('./Classes/Components/Sentinel.js'),
  Entry = require('./Classes/Data/Entry.js'),
  Id = require('./Classes/Data/Id.js'),
  Location = require('./Classes/Data/Location.js'),
  Proximity = require('./Classes/Data/Proximity.js'),
  Query = require('./Classes/Data/Query.js'),
  Simple = require('./Classes/Data/Simple.js'),
  Base = require('./Classes/Base.js');

let XYO = {

  DATA: {
    Entry: Entry,
    Id: Id,
    Location: Location,
    Proximity: Proximity,
    Query: Query,
    Simple: Simple
  },

  COMPONENTS: {
      Node: Node,
      Archivist: Archivist,
      Bridge: Bridge,
      Sentinel: Sentinel,
      Diviner: Diviner
  },

  Base() {
    return Base;
  }
}

module.exports = XYO;

/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Sunday, March 4, 2018 2:34 PM
 * @Email:  developer@xyfindables.com
 * @Filename: xyo.js
 * @Last modified by:   arietrouw
 * @Last modified time: Tuesday, March 6, 2018 5:03 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const Archivist = require(`./Classes/Components/Archivist.js`);
const Bridge = require(`./Classes/Components/Bridge.js`);
const Diviner = require(`./Classes/Components/Diviner.js`);
const Node = require(`./Classes/Components/Node.js`);
const Sentinel = require(`./Classes/Components/Sentinel.js`);
const Entry = require(`./Classes/Data/Entry.js`);
const Id = require(`./Classes/Data/Id.js`);
const Location = require(`./Classes/Data/Location.js`);
const Proximity = require(`./Classes/Data/Proximity.js`);
const Query = require(`./Classes/Data/Query.js`);
const Simple = require(`./Classes/Data/Simple.js`);
const Base = require(`./Classes/Base.js`);

const XYO = {
  SERVER: {

    DATA: {
      Entry,
      Id,
      Location,
      Proximity,
      Query,
      Simple,
    },

    COMPONENTS: {
      Node,
      Archivist,
      Bridge,
      Sentinel,
      Diviner,
    },

    Base() {
      return Base;
    },
  },
};

module.exports = XYO;

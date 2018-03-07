/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Saturday, July 18, 2015 11:24 PM
 * @Email:  developer@xyfindables.com
 * @Filename: index.js
 * @Last modified by:   arietrouw
 * @Last modified time: Tuesday, March 6, 2018 4:59 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const debug = require(`debug`)(`xyo-node`);
const CONFIG = require(`config`);
const TESTDATACLASSES = require(`./testdataclasses.js`);
const XYO = require(`./xyo.server.js`);

/* ================= */
/*  Local Functions  */
/* ================= */

const initialize = (complete) => {
  debug(`Initializing...`);

  if (CONFIG.sentinels) {
    Object.keys(CONFIG.sentinels).forEach((key) => {
      const sentinel = CONFIG.sentinels[key];

      debug(`Sentinel Action: ${sentinel.action}`);
      if (sentinel.action === `launch`) {
        XYO.SERVER.fromPort[sentinel.ports.pipe] = XYO.SERVER.fromPort[sentinel.ports.pipe] || new XYO.SERVER.Sentinel(`sentinel-${key}`, sentinel.host, sentinel.ports, sentinel.config || {});
      }
    });
  }

  if (CONFIG.bridges) {
    Object.keys(CONFIG.bridges).forEach((key) => {
      const bridge = CONFIG.bridges[key];

      debug(`Bridge Action: ${bridge.action}`);
      if (bridge.action === `launch`) {
        XYO.SERVER.fromPort[bridge.ports.pipe] = XYO.SERVER.fromPort[bridge.ports.pipe] || new XYO.SERVER.Bridge(`bridge-${key}`, bridge.host, bridge.ports, bridge.config || {});
      }
    });
  }

  if (CONFIG.archivists) {
    Object.keys(CONFIG.archivists).forEach((key) => {
      const archivist = CONFIG.archivists[key];

      debug(`Archivist Action: ${archivist.action}`);

      if (archivist.action === `launch`) {
        XYO.SERVER.fromPort[archivist.ports.pipe] = XYO.SERVER.fromPort[archivist.ports.pipe] || new XYO.SERVER.Archivist(`acrhivist-${key}`, archivist.host, archivist.ports, archivist.config || {});
        XYO.SERVER.fromPort[archivist.ports.pipe].findPeers(CONFIG.archivists);
      }
    });
  }

  if (CONFIG.diviners) {
    Object.keys(CONFIG.diviners).forEach((key) => {
      const diviner = CONFIG.diviners[key];

      debug(`Diviner Action: ${diviner.action}`);

      if (diviner.action === `launch`) {
        XYO.SERVER.fromPort[diviner.ports.pipe] = XYO.SERVER.fromPort[diviner.ports.pipe] || new XYO.SERVER.Diviner(`diviner-${key}`, diviner.host, diviner.ports, diviner.config || {});
        XYO.SERVER.fromPort[diviner.ports.pipe].findPeers(CONFIG.diviners);
        XYO.SERVER.fromPort[diviner.ports.pipe].findArchivists(CONFIG.archivists);
      }
    });
  }

  if (complete) {
    complete();
  }
};

const updateObjects = () => {
  debug(`>>>>>>>>TIMER<<<<<<<<< [${Object.keys(XYO.SERVER.COMPONENTS.Node.fromMoniker).length}]`);

  XYO.SERVER.Base.updateCount++;

  Object.keys(XYO.SERVER.COMPONENTS.Node.fromMoniker).forEach((key) => {
    XYO.SERVER.COMPONENTS.Node.fromMoniker[key].update(CONFIG);
  });
};

const startTimers = () => {
  setInterval(() => {
    updateObjects();
  }, CONFIG.clock);
};

const run = () => {
  updateObjects();
  startTimers();
};


initialize(() => {
  if (CONFIG.testdataclasses) {
    TESTDATACLASSES.All();
  }
  run();
});

/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 6, 2018 10:38 AM
 * @Email:  developer@xyfindables.com
 * @Filename: testdataclasses.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 23, 2018 11:16 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const debug = require(`debug`)(`testsataclasses`);
const TestDataClasses = {};
const XYO = require(`../src/js/index.js`);

TestDataClasses.All = () => {
  debug(`***********************************`);
  debug(`*      Testing Data Classes       *`);
  debug(`***********************************`);

  const simple = new XYO.SERVER.DATA.Simple();
  const entry = new XYO.SERVER.DATA.Entry();
  const node = new XYO.SERVER.COMPONENTS.Node(`test`, `localhost`, {
    api: 8080,
    pipe: 8088,
  }, {});

  entry.payloads.push((new XYO.SERVER.DATA.Id()).toBuffer());

  entry.p2keys = [];
  for (let i = 0; i < node.keys.length; i++) {
    entry.p2keys.push(node.keys[i].exportKey(`components-public`).n);
  }

  entry.p1Sign(payload => node.sign(payload), () => {});

  entry.p2Sign(payload => node.sign(payload), () => {});

  debug(`* ===== O2B Testing 'simple' ===== *`);
  const b0 = simple.toBuffer();
  debug(b0);

  debug(`* ===== O2B Testing 'entry' ===== *`);
  const b2 = entry.toBuffer();
  debug(b2);

  debug(`* ===== B2O Testing 'simple' ===== *`);
  const res0 = XYO.SERVER.DATA.Simple.fromBuffer(b0);
  debug(JSON.stringify(res0));

  debug(`* ===== B2O Testing 'entry' ===== * `, b2);
  const res2 = XYO.SERVER.DATA.Simple.fromBuffer(b2);
  debug(JSON.stringify(res2));
};

module.exports = TestDataClasses;

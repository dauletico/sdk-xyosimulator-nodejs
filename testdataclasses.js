/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Tuesday, February 6, 2018 10:38 AM
 * @Email:  developer@xyfindables.com
 * @Filename: testdataclasses.js
 * @Last modified by:   arietrouw
 * @Last modified time: Sunday, March 4, 2018 9:42 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";
const debug = require("debug")("testsataclasses"),
  TestDataClasses = {},
  XYO = require("./xyo.js");

TestDataClasses.All = () => {

  debug("***********************************");
  debug("*      Testing Data Classes       *");
  debug("***********************************");

  let simple = new XYO.DATA.Simple(),
    entry = new XYO.DATA.Entry(),
    node = new XYO.COMPONENTS.Node('test', 'localhost', {
      api: 8080,
      pipe: 8088
    }, {}),
    b0, b2,
    res0, res2;

  entry.payload = (new XYO.DATA.Id()).toBuffer();

  entry.p2keys = [];
  for (let i = 0; i < node.keys.length; i++) {
    entry.p2keys.push(node.keys[i].exportKey('components-public').n);
  }

  entry.p1Sign((payload) => {
    return node.sign(payload);
  }, () => {});

  entry.p2Sign((payload) => {
    return node.sign(payload);
  }, () => {});

  debug("* ===== O2B Testing 'simple' ===== *");
  b0 = simple.toBuffer();
  debug(b0);

  debug("* ===== O2B Testing 'entry' ===== *");
  b2 = entry.toBuffer();
  debug(b2);

  debug("* ===== B2O Testing 'simple' ===== *");
  res0 = XYO.DATA.Simple.fromBuffer(b0);
  debug(JSON.stringify(res0));

  debug("* ===== B2O Testing 'entry' ===== * ", b2);
  res2 = XYO.DATA.Simple.fromBuffer(b2);
  debug(JSON.stringify(res2));

};

module.exports = TestDataClasses;

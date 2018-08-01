process.env.DEBUG = "*"

const debug = require(`debug`)(`archivist`);
const XYO = require(`../src/js/index.js`);

var sentinel = new XYO.Component.Sentinel("S1", "localhost", 8060)
var bridge = new XYO.Component.Bridge("B1", "localhost", 8070)
var archivist = new XYO.Component.Archivist("A1", "localhost", 8080)

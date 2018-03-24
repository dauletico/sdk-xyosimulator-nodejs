/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 12:17 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Sentinel.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 23, 2018 11:23 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const debug = require(`debug`)(`Sentinel`);
const Node = require(`./Node.js`);
const Entry = require(`../Data/Entry.js`);
const Id = require(`../Data/Id.js`);

class Sentinel extends Node {
  constructor(moniker, host, ports, config) {
    debug(`constructor`);

    process.title = `XYO-Sentinel`;

    super(moniker, host, ports, config);
    this.bridges = [];
  }

  findSentinels(sentinels) {
    debug(`findSentinels`);

    this.peers = []; // remove old ones
    Object.keys(sentinels).forEach((key) => {
      const sentinel = sentinels[key];

      if (!(sentinel.ports.pipe === this.ports.pipe && sentinel.host === this.host)) {
        this.addPeer(
          sentinel.host,
          sentinel.ports,
        );
      }
    });
  }

  findBridges(bridges) {
    debug(`findBridges`);

    this.bridges = []; // remove old ones
    Object.keys(bridges).forEach((key) => {
      const bridge = bridges[key];

      this.addBridge(
        bridge.host,
        bridge.ports,
      );
    });
  }

  addBridge(host, ports) {
    debug(`addBridge`);
    if (!(this.host === host && this.ports.pipe === ports.pipe)) {
      this.bridges.push({ host, port: ports.pipe });
    }
  }

  initiateBoundWitness(_payload) {
    debug(`initiateBoundWitness`);
    const peer = Math.floor(Math.random() * 10);

    if (peer < this.peers.length) {
      const entry = new Entry();

      entry.p2keys = [];
      for (let i = 0; i < this.keys.length; i++) {
        entry.p2keys.push(this.keys[i].exportKey(`components-public`).n);
      }

      const id = new Id();

      if (!id) {
        throw new Error(`Missing Id`);
      }

      if (_payload) {
        entry.payloads.push(_payload);
      }

      const buffer = entry.toBuffer();
      this.out(this.peers[peer], buffer);
    }
  }

  selfSignBoundWitness(_payload) {
    debug(`selfSignBoundWitness`);
    const entry = new Entry();

    entry.p2keys = [];
    for (let i = 0; i < this.keys.length; i++) {
      entry.p2keys.push(this.keys[i].exportKey(`components-public`).n);
    }

    const id = new Id();

    if (!id) {
      throw new Error(`Missing Id`);
    }
    if (_payload) {
      entry.payloads.push(_payload);
    }

    const buffer = entry.toBuffer();
    this.loopback(buffer);
  }

  initiateBridgeSend(maxEntries) {
    debug(`initiateBridgeSend`);
    const bridge = Math.floor(Math.random() * 10);

    if (bridge < this.bridges.length) {
      const entry = new Entry();

      entry.p2keys = [];

      for (let i = 0; i < maxEntries && i < this.entries.length; i++) {
        const buf = this.entries[i].toBuffer();

        if (!buf) {
          throw new Error(`Missing Payload`);
        }

        entry.payloads.push(buf);
      }
      for (let i = 0; i < this.keys.length; i++) {
        entry.p2keys.push(this.keys[i].exportKey(`components-public`).n);
      }
      const buffer = entry.toBuffer();
      this.out(this.bridges[bridge], buffer);
    }
  }

  onEntry(socket, entry) {
    debug(`onEntry`);
    super.onEntry(socket, entry);
  }

  in(socket) {
    debug(`in`);
    super.in(socket);
  }

  out(target, buffer) {
    debug(`out`);
    super.out(target, buffer);
  }

  update(config) {
    super.update(config);
    debug(`update`);
    if (this.bridges.length === 0) {
      this.findSentinels(config.sentinels);
      this.findBridges(config.bridges);
    }
    this.initiateBoundWitness();
    // this.initiateBridgeSend(2);
  }

  status() {
    const status = super.status();

    status.type = `Sentinel`;
    status.bridges = this.bridges.length;
    return status;
  }
}

module.exports = Sentinel;

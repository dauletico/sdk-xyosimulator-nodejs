/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 5:06 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Node.js
 * @Last modified by:   arietrouw
 * @Last modified time: Tuesday, March 6, 2018 3:58 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const debug = require(`debug`)(`Node`),
  Base = require(`../Base`),
  Express = require(`express`),
  bodyParser = require(`body-parser`),
  NodeRSA = require(`node-rsa`),
  NET = require(`net`),
  XYO = require(`../../xyo.js`);

class Node extends Base {
  constructor(moniker, host, ports, config) {
    debug(`constructor`);

    super();
    this.moniker = moniker;

    this.entries = [];

    this.host = host;
    this.ports = ports;
    this.app = Express();
    this.app.listen(ports.api);
    this.server = NET.createServer((socket) => {
      this.in(socket);
    });
    this.server.listen(ports.pipe);
    this.peers = [];
    this.config = config;
    this.keys = [];
    Node.fromMoniker[moniker] = this;
    Node.fromPort[ports.api] = this;
    Node.fromPort[ports.pipe] = this;
    this.initKeys(3);
    this.app.use(bodyParser.json());
    this.app.use((req, res, next) => {
      res.header(`Access-Control-Allow-Origin`, `*`);
      res.header(`Access-Control-Allow-Headers`, `Origin, X-Requested-With, Content-Type, Accept`);
      next();
    });
    this.app.get(`*`, (req, res) => {
      this.get(req, res);
    });
    this.app.post(`*`, (req, res) => {
      if (!(req.body)) {
        res.status(400).send(`Empty body not allowed`);
      }
      this.post(req, res);
    });
  }

  get(req, res) {
    debug(`get`);
    const contentType = req.headers[`content-type`];
    const pathParts = req.path.split(`/`);

    if (contentType && pathParts.length > 1) {
      const action = pathParts[1];

      switch (contentType) {
        case `application/json`:
          switch (action) {
            case `status`:
              return this.returnJSONStatus(req, res);
            case `entries`:
              return this.returnJSONEntries(req, res);
            default:
              return res.status(404).send(`({req.path}) Not Found`);
          }
        default:
          return res.status(415).send(req.path);
      }
    }
    return res.status(404).send(req.path);
  }

  post(req, res) {
    debug(`post`);
    const contentType = req.headers[`content-type`];

    if (!contentType) {
      return res.status(415).send(req.path);
    }
    switch (contentType) {
      case `application/json`:
        return this.returnJSONStatus(req, res);
      default:
        return res.status(415).send(req.path);
    }
  }

  in(socket) {
    debug(`in`);
    let inData = null;

    socket.on(`data`, (buffer) => {
      debug(`in:data: `, buffer.length);
      let result;

      if (inData) {
        inData = Buffer.concat([inData, buffer]);
      } else {
        inData = buffer;
      }

      if (inData.length >= 4) {
        debug(`in:data: checking: `, buffer);

        result = XYO.Simple.fromBuffer(inData);
        if (result.obj) {
          switch (result.obj.map) {
            case `entry`:
              this.onEntry(socket, result.obj);
              break;
            default:
              break;
          }
          inData = null;
        } else {
          debug(`in:noobj`);
        }
      } else {
        debug(`waiting:{}`, inData.length);
      }
    }).on(`close`, () => {
      debug(`in:close`);
    }).on(`end`, () => {
      debug(`in:end`);
    });
  }

  onEntry(socket, entry) {
    debug(`onEntry: {}`);
    const self = this;

    if (entry.p1signatures.length === 0) {
      debug(`onEntry: P1`);
      entry.p1Sign((payload) => {
        const signatures = self.sign(payload);

        return signatures;
      }, () => {
        const buffer = entry.toBuffer();

        socket.write(buffer);
      });
    } else if (entry.p2signatures.length === 0) {
      debug(`onEntry: P2`);
      entry.p2Sign(
        payload => self.sign(payload),
        () => {
          const buffer = entry.toBuffer();

          socket.write(buffer);
          this.addEntryToLedger(entry);
        },
      );
    } else {
      debug(`onEntry: DONE`);
      this.addEntryToLedger(entry);
    }
  }

  out(target, buffer) {
    debug(`out: ${target.host},${target.port},${buffer.length}`);
    let inData = null;
    const socket = NET.createConnection(target.port, target.host);

    socket.on(`data`, (data) => {
      if (inData) {
        inData = Buffer.concat([inData, data]);
      } else {
        inData = data;
      }

      const result = XYO.Simple.fromBuffer(inData);

      if (result.obj) {
        switch (result.obj.map) {
          case `entry`:
            this.onEntry(socket, result.obj);
            break;
          default:
            break;
        }
        inData = null;
      }
    }).on(`connect`, () => {
      debug(`out:connect`);
      socket.write(buffer);
    }).on(`end`, () => {
      debug(`out:done`);
    }).on(`error`, (ex) => {
      debug(`error:${ex}`);
    });
  }

  addPeer(host, ports) {
    debug(`addPeer[${host}, ${ports.pipe}]`);
    if (!(this.host === host && this.ports.pipe === ports.pipe)) {
      this.peers.push({
        host,
        port: ports.pipe,
      });
    }
  }

  update() {
    debug(`update`);
    Node.updateCount++;
  }

  shutdown() {
    debug(`shutdown`);
    delete Base.fromMoniker[this.moniker];
    delete Base.fromPort[this.port];
  }

  addEntryToLedger(entry) {
    debug(`addEntryToLedger`);
    if (this.entries.length > 0) {
      this.signHeadAndTail(this.entries[this.entries.length - 1]);
    }
    this.entries.push(entry);
  }

  signHeadAndTail(_entry) {
    debug(`signHeadAndTail`);
    const entry = _entry;
    const headKeys = this.keys.slice(0);

    this.spinKeys();

    entry.headKeys = this.publicKeysFromKeys(headKeys);
    entry.tailKeys = this.publicKeysFromKeys(this.keys);

    const payload = entry.toBuffer();

    this.signHead(entry, payload, headKeys);
    this.signTail(entry, payload, this.keys);
  }

  signHead(_entry, payload, keys) {
    debug(`signHead`);
    const entry = _entry;

    const result = this.sign(payload, keys);
    entry.headSignatures = result.signatures;
  }

  signTail(_entry, _payload, _keys) {
    debug(`signTail`);
    const entry = _entry;

    const result = this.sign(_payload, _keys);
    entry.tailSignatures = result.signatures;
  }

  publicKeysFromKeys(keys) {
    const publicKeys = [];

    for (let i = 0; i < keys.length; i++) {
      publicKeys.push(keys[i].exportKey(`components-public`).n);
    }

    return publicKeys;
  }

  initKeys(count) {
    debug(`initKeys`);
    this.keys = [];
    for (let i = 0; i < count; i++) {
      this.keys.push(new NodeRSA({ b: 512 }));
    }
  }

  sign(payload, signingKeys) {
    debug(`sign`);
    const keys = [];
    let signature;
    const signatures = [];
    const signKeys = signingKeys || this.keys;

    for (let i = 0; i < signKeys.length; i++) {
      signature = signKeys[i].sign(payload);
      debug(`SIGLEN: ${signature.length}`);
      signatures.push(signature);
      keys.push(signKeys[i].exportKey(`components-public`).n);
      debug(`sign: ${i},${signatures[i].length}`);
    }
    return {
      signatures,
      keys,
    };
  }

  getKeyUses(index) {
    debug(`getKeyUses`);
    return (index + 1) * (index + 1);
  }

  // Add one to the use number of each key, and if they have been used too much, regenerate
  spinKeys() {
    debug(`spinkKeys`);
    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i];

      key.used += 1;
      if (key.used >= this.getKeyUses(i)) {
        this.keys[i] = new NodeRSA({ b: 512 });
      }
    }
  }

  status() {
    debug(`status`);
    return {
      moniker: this.moniker,
      enabled: true,
      peers: this.peers.length,
      host: this.host,
      port: this.port,
      config: this.config,
      type: this.name,
      ledger: {
        entries: this.entries.length,
      },
    };
  }

  returnJSONStatus(req, res) {
    debug(`returnJSONStatus`);
    res.status(200).send(JSON.stringify(this.status()));
  }

  returnJSONEntries(req, res) {
    debug(`returnJSONItems`);
    const pathParts = req.path.split(`/`);
    let id = null;

    if (pathParts.length > 2) {
      id = pathParts[2];
    }

    if (id && id.length > 0) {
      const entries = [this.entriesByP1Key[id], this.entriesByP2Key[id], this.entriesByHeadKey[id], this.entriesByTailKey[id]];

      if (entries) {
        return res.send({
          id,
          entries: this.entriesByKey[id],
        });
      }
      return res.status(404).send(format(`({}) Not Found`, id));
    }
    const results = [];

    for (let i = 0; i < this.entries.length && i < 50; i++) {
      results.push(this.entries[i]);
    }

    return res.send({
      entries: results,
    });
  }
}

// static variables
Node.fromMoniker = {};
Node.fromPort = {};
Node.updateCount = 0;

module.exports = Node;

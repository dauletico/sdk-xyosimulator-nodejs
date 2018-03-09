/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 5:06 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Node.js
 * @Last modified by:   arietrouw
 * @Last modified time: Thursday, March 8, 2018 4:07 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const debug = require(`debug`)(`Node`);
const Base = require(`../Base`);
const Express = require(`express`);
const bodyParser = require(`body-parser`);
const NodeRSA = require(`node-rsa`);
const NET = require(`net`);
const Simple = require(`../../Classes/Data/Simple.js`);

class Node extends Base {
  constructor(_moniker, _host, _ports, _config) {
    debug(`constructor`);

    super();
    this.moniker = _moniker;

    this.entries = [];

    this.host = _host;
    this.ports = _ports;
    this.app = Express();
    this.app.listen(_ports.api);
    this.server = NET.createServer((socket) => {
      this.in(socket);
    });
    this.server.listen(_ports.pipe);
    this.peers = [];
    this.config = _config;
    this.keys = [];
    Node.fromMoniker[this.moniker] = this;
    Node.fromPort[_ports.api] = this;
    Node.fromPort[_ports.pipe] = this;
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

  get(_req, _res) {
    debug(`get`);
    const contentType = _req.headers[`content-type`];
    const pathParts = _req.path.split(`/`);

    if (contentType && pathParts.length > 1) {
      const action = pathParts[1];

      switch (contentType) {
        case `application/json`:
          switch (action) {
            case `status`:
              return this.returnJSONStatus(_req, _res);
            case `entries`:
              return this.returnJSONEntries(_req, _res);
            default:
              return _res.status(404).send(`(${_req.path}) Not Found`);
          }
        default:
          return _res.status(415).send(_req.path);
      }
    }
    return _res.status(404).send(_req.path);
  }

  post(_req, _res) {
    debug(`post`);
    const contentType = _req.headers[`content-type`];

    if (!contentType) {
      return _res.status(415).send(_req.path);
    }
    switch (contentType) {
      case `application/json`:
        return this.returnJSONStatus(_req, _res);
      default:
        return _res.status(415).send(_req.path);
    }
  }

  in(_socket) {
    debug(`in`);
    let inData = null;

    _socket.on(`data`, (buffer) => {
      debug(`in:data: `, buffer.length);

      if (inData) {
        inData = ByteBuffer.concat([inData, buffer]);
      } else {
        inData = buffer;
      }

      if (inData.length >= 4) {
        debug(`in:data: checking: `, inData);
        this.inData(inData);
      } else {
        debug(`waiting:{}`, inData.length);
      }
    }).on(`close`, () => {
      debug(`in:close`);
    }).on(`end`, () => {
      debug(`in:end`);
    });
  }

  inData(_socket, _buffer, _callback) {
    const result = Simple.fromBuffer(_buffer);
    debug(`inData: `, result);
    if (result.obj) {
      switch (result.obj.map) {
        case `entry`:
          this.onEntry(_socket, result.obj, _callback);
          break;
        default:
          break;
      }
      return true;
    }
    debug(`inData:noobj`);
    return false;
  }

  loopback(_buffer, _callback) {
    this.inData(null, _buffer, _callback);
  }

  // if the socket is null, we are in loopback mode
  onEntry(_socket, _entry, _callback) {
    debug(`onEntry: {}`);
    const self = this;

    if (_entry.p1signatures.length === 0) {
      debug(`onEntry: P1`);
      _entry.p1Sign((payload) => {
        const signatures = self.sign(payload);

        return signatures;
      }, () => {
        const buffer = _entry.toBuffer();
        if (_socket) {
          _socket.write(buffer);
        } else {
          this.inData(buffer, _callback);
        }
      });
    } else if (_entry.p2signatures.length === 0) {
      debug(`onEntry: P2`);
      _entry.p2Sign(
        payload => self.sign(payload),
        () => {
          const buffer = _entry.toBuffer();
          if (_socket) {
            _socket.write(buffer);
          } else {
            this.inData(buffer, _callback);
          }
          this.addEntryToLedger(_entry);
        },
      );
    } else {
      debug(`onEntry: DONE`);
      this.addEntryToLedger(_entry);
      _callback();
    }
  }

  out(_target, _buffer) {
    debug(`out: ${_target.host},${_target.port},${_buffer.length}`);
    let inData = null;
    const socket = NET.createConnection(_target.port, _target.host);

    socket.on(`data`, (data) => {
      if (inData) {
        inData = ByteBuffer.concat([inData, data]);
      } else {
        inData = data;
      }

      const result = Simple.fromBuffer(inData);

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
      socket.write(_buffer);
    }).on(`end`, () => {
      debug(`out:done`);
    }).on(`error`, (ex) => {
      debug(`error:${ex}`);
    });
  }

  addPeer(_host, _ports) {
    debug(`addPeer[${_host}, ${_ports.pipe}]`);
    if (!(this.host === _host && this.ports.pipe === _ports.pipe)) {
      this.peers.push({
        _host,
        port: _ports.pipe,
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

  addEntryToLedger(_entry) {
    debug(`addEntryToLedger`);
    if (this.entries.length > 0) {
      this.signHeadAndTail(this.entries[this.entries.length - 1]);
    }
    this.entries.push(_entry);
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

  signHead(_entry, _payload, _keys) {
    debug(`signHead`);
    const entry = _entry;

    const result = this.sign(_payload, _keys);
    entry.headSignatures = result.signatures;
  }

  signTail(_entry, _payload, _keys) {
    debug(`signTail`);
    const entry = _entry;

    const result = this.sign(_payload, _keys);
    entry.tailSignatures = result.signatures;
  }

  publicKeysFromKeys(_keys) {
    const publicKeys = [];

    for (let i = 0; i < _keys.length; i++) {
      publicKeys.push(_keys[i].exportKey(`components-public`).n);
    }

    return publicKeys;
  }

  initKeys(_count) {
    debug(`initKeys`);
    this.keys = [];
    for (let i = 0; i < _count; i++) {
      this.keys.push(new NodeRSA({ b: 512 }));
    }
  }

  sign(_payload, _signingKeys) {
    debug(`sign`);
    const keys = [];
    let signature;
    const signatures = [];
    const signKeys = _signingKeys || this.keys;

    for (let i = 0; i < signKeys.length; i++) {
      signature = signKeys[i].sign(_payload);
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

  getKeyUses(_index) {
    debug(`getKeyUses`);
    return (_index + 1) * (_index + 1);
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

  returnJSONStatus(_req, _res) {
    debug(`returnJSONStatus`);
    _res.status(200).send(JSON.stringify(this.status()));
  }

  returnJSONEntries(_req, _res) {
    debug(`returnJSONItems`);
    const pathParts = _req.path.split(`/`);
    let id = null;

    if (pathParts.length > 2) {
      id = pathParts[2];
    }

    if (id && id.length > 0) {
      const entries = [this.entriesByP1Key[id], this.entriesByP2Key[id], this.entriesByHeadKey[id], this.entriesByTailKey[id]];

      if (entries) {
        return _res.send({
          id,
          entries: this.entriesByKey[id],
        });
      }
      return _res.status(404).send(`(${id}) Not Found`);
    }
    const results = [];

    for (let i = 0; i < this.entries.length && i < 50; i++) {
      results.push(this.entries[i]);
    }

    return _res.send({
      entries: results,
    });
  }
}

// static variables
Node.fromMoniker = {};
Node.fromPort = {};
Node.updateCount = 0;

module.exports = Node;

/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 12:17 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Diviner.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 23, 2018 11:31 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


const debug = require(`debug`)(`Diviner`);
const Node = require(`./Node.js`);
const HTTP = require(`http`);
const Query = require(`../Data/Query.js`);
// const ethers = require(`ethers`);
const XYOSolidity = require(`xyo-solidity`);

class Diviner extends Node {
  constructor(moniker, host, ports, config) {
    debug(`constructor: `);
    process.title = `XYO-Diviner`;
    super(moniker, host, ports, config);
    this.archivists = [];
    this.pendingQueries = [];
    this.completedQueries = [];
    this.web3 = null;
    this.blockHeadersSubscription = null;
    this.xyUncalibratedQueryAddress = null;
    if (config && config.ethAddress) {
      this.connectToEthereum(config.ethAddress);
    }
    if (config && config.xyUncalibratedQueryAddress) {
      this.xyUncalibratedQueryAddress = config.xyUncalibratedQueryAddress;
    } else {
      this.createXYUncalibratedQueryContract();
    }
  }

  connectToEthereum(address) {
    debug(`connectToEthereum: `, address);
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

  getUncalibratedContract() {
    const compiled = new XYOSolidity().contracts.load(`XYUncalibratedQuery.sol`, `XYUncalibratedQuery`);
    const abi = JSON.parse(compiled.interface);

    return { compiled, contract: this.web3.eth.contract(abi) };
  }

  getPendingUncalibratedQueries(callback) {
    debug(`getPendingUncalibratedQueries`);
    const xyContract = this.getUncalibratedContract();
    const xyInstance = xyContract.contract.at(this.uncalibratedContractAddress);

    xyInstance.pendingQueries(this.web3.eth.defaultAccount, (error, result) => {
      if (error) {
        debug(`Error: `, error);
        callback(error, null);
      } else {
        callback(null, Query.fromArray(result));
      }
    });
  }

  createXYUncalibratedQueryContract() {
    debug(`createXYUncalibratedQueryContract`);
    const contract = this.getUncalibratedContract();

    contract.contract.new({
      data: `0x${contract.compiled.bytecode}`,
      from: this.web3.eth.coinbase,
      gas: 90000 * 10,
    }, (err, res) => {
      if (err) {
        debug(`Error:`, err);
        return;
      }

      // Log the tx, you can explore status with eth.getTransaction()
      debug(`TransactionHash: `, res.transactionHash);

      // If we have an address property, the contract was deployed
      if (res.address) {
        debug(`Contract address: `, res.address);
        this.xyUncalibratedQueryAddress = res.address;
      }
    });
  }

  query(question, callback) {
    debug(`query`);
    this.findBlocks(question, (blocks) => {
      this.processBlocks(question, blocks, (answer) => {
        callback({
          success: (answer.accuracy >= question.accuracy && answer.certainty >= question.certainty),
          question,
          answer,
          blocks,
        });
      });
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
            case `pending`:
              return this.returnJSONPending(req, res);
            default:
              return super.get(req, res);
          }
        default:
          return super.get(req, res);
      }
    }
    return super.get(req, res);
  }

  post(req, res) {
    debug(`post`);
    const contentType = req.headers[`content-type`];
    const pathParts = req.path.split(`/`);

    if (contentType) {
      const action = pathParts[1];

      switch (contentType) {
        case `application/json`:
          switch (action) {
            case `query`:
              return this.postQuery(req, res);
            default:
              break;
          }
          break;
        default:
          break;
      }
    }
    return super.post(req, res);
  }

  postQuery(req, res) {
    return res.status(200).send(req.path);
  }

  processBlocks(question, blocks, callback) {
    debug(`processBlocks`);
    callback(null, {});
  }

  findBlocks(pk, epoch, callback) {
    debug(`findBlocks`);
    let count = this.archivist.length;
    const blocks = [];

    this.archivists.forEach((archivist) => {
      Diviner.getBlock(pk, epoch, archivist, (err, block) => {
        if (!err) {
          blocks.push(JSON.parse(block));
        }
        count--;
        if (count === 0) {
          callback(blocks);
        }
      });
    });
  }

  static getBlock(pk, epoch, url, callback) {
    debug(`getBlock`);
    HTTP.get(`${url}/?key=${pk}&epoch=${epoch}`, (resp) => {
      let data = ``;

      resp.on(`data`, (chunk) => {
        data += chunk;
      });

      resp.on(`end`, () => {
        callback(null, data);
      });
    }).on(`error`, (err) => {
      callback(err, null);
    });
  }

  getPending() {
    return {
      queries: [{
        target: `xxxxx`,
        bounty: 1,
      }, {
        target: `yyyyy`,
        bounty: 1,
      }],
    };
  }

  findPeers(diviners) {
    debug(`findPeers`);

    Object.keys(diviners).forEach((key) => {
      const diviner = diviners[key];

      if (!(diviner.ports.pipe === this.ports.pipe && diviner.host === this.host)) {
        this.addPeer(
          diviner.host,
          diviner.ports.pipe,
        );
      }
    });
  }

  findArchivists(archivists) {
    debug(`findArchivists`);
    let key;

    Object.keys(archivists).forEach(key, function () {
      const archivist = archivists[key];

      if (!(archivist.ports.pipe === this.ports.pipe && archivist.host === this.host)) {
        this.addArchivist(
          archivist.host,
          archivist.ports.pipe,
        );
      }
    });
  }

  addArchivist(host, ports) {
    debug(`addArchivist`);
    if (!(this.host === host && this.ports.pipe === ports.pipe)) {
      this.archivists.push({
        host,
        port: ports.pipe,
      });
    }
  }

  update(config) {
    debug(`update: `, Node.updateCount);
    super.update(config);
    if (this.archivists.length === 0) {
      this.findArchivists(config.archivists);
      this.findPeers(config.diviners);
    }
    if (Node.updateCount) {
      this.getPendingUncalibratedQueries(() => {

      });
    }
  }

  status() {
    const status = super.status();

    status.type = `Diviner`;
    status.archivists = this.archivists.length;
    return status;
  }

  returnJSONPending(req, res) {
    debug(`returnJSONPending`);
    res.status(200).send(JSON.stringify(this.getPending()));
  }
}

module.exports = Diviner;

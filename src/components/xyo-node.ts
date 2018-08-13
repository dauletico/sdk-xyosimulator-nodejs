/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 2nd August 2018 10:47:41 am
 * @Email: developer@xyfindables.com
 * @Filename: xyo-node.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 13th August 2018 4:22:49 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IDiscoverable, INetworkExcludeContainer } from '../types';
import debugLib from 'debug';
import XYOBase from '../xyo-base';
import { default as express, Express, Request, Response, NextFunction } from 'express';
import { default as net, Server, Socket } from 'net';
import { PortsContainer } from '../utils/ports-container';
import { NodeDiscoveryService, DISCOVERY_TYPE } from '../services/node-discovery.service';
import { BitStreamDecoder } from '../utils/bit-stream-decoder';
import Logger from '../logger';
import { XYOComponentType } from './xyo-component-type.enum';
import { NetworkProtocol } from '../utils/network-protocol.enum';

const debug = debugLib('Node');

export class XYONode extends XYOBase {
  /** If true, will continue run run-loop */
  public doLoop: boolean = false;

  /** Our http server we will be servicing requests on */
  private httpServer: Express;

  /** Our socket server where we will communicating to other nodes on */
  private socketServer: Server;

  private peers: {[s: string]: IDiscoverable[]};

  /**
   * Create an XYONode
   *
   * @param moniker The name of the node
   * @param host The host where this node can be found
   * @param ports Port config for this node
   */

  constructor(
    public readonly moniker: string,
    public readonly host: string,
    public readonly ports: PortsContainer,
    public readonly isDiscoverable: boolean,
    private readonly maxPeers: number,
    private readonly nodeDiscoveryService: NodeDiscoveryService,
    private readonly logger: Logger
  ) {
    super();
    this.log(`constructor`);
    this.nodeDiscoveryService.onPeerDiscovered(this.onPeerDiscovered.bind(this));
    this.httpServer = express();
    this.httpServer.listen(this.ports.http);

    /**
     * A type safe way of initializing peers object.
     * Initialize peers object by iterating through component types.
     */
    this.peers = Object.keys(XYOComponentType)
      .reduce((memo: {[s: string]: IDiscoverable[]}, value) => {
        memo[value] = [];
        return memo;
      }, {});

    this.addHTTPRoutes();

    this.socketServer = net.createServer(this.onSocketIn.bind(this));
    this.socketServer.listen(this.ports.socket);
  }

  public getType(): XYOComponentType {
    return XYOComponentType.XYONode;
  }

  public getPeerCount(): number {
    return Object.keys(this.peers).reduce((sum, peerCollectionType) => {
      return sum + this.peers[peerCollectionType].length;
    }, 0);
  }

  public run(): { stop: () => void } {
    this.doLoop = true;
    this.loop();
    return {
      stop: () => {
        this.doLoop = false;
      }
    };
  }

  private async loop(): Promise<void> {
    this.log(`Loop`);
    if (this.doLoop) {
      await this.startDiscovering();
    }

    setTimeout(() => {
      this.loop();
    }, 1000);
  }

  private async startDiscovering() {
    this.log(`startDiscovering`);

    if (this.getPeerCount() >= this.maxPeers) {
      return;
    }

    await this.discoverPeers(DISCOVERY_TYPE.LOCALHOST);
    if (this.getPeerCount() >= this.maxPeers) {
      return;
    }

    await this.discoverPeers(DISCOVERY_TYPE.SUBNET);
    if (this.getPeerCount() >= this.maxPeers) {
      return;
    }

    await this.discoverPeers(DISCOVERY_TYPE.REMOTE);
    if (this.getPeerCount() >= this.maxPeers) {
      return;
    }
  }

  private async discoverPeers(discoveryType: DISCOVERY_TYPE): Promise<void> {
    this.log(`discoverOtherNodesOnSubnet`);

    await this.nodeDiscoveryService.discoverPeers(
      discoveryType,
      this.buildExclusions(),
      this.maxPeers
    );

    return;
  }

  /**
   * Builds Exclusion map
   */
  private buildExclusions(): INetworkExcludeContainer {
    const startingExclusions: INetworkExcludeContainer = {
      byNetworkAddress: {},
      byMoniker: {}
    };

    startingExclusions.byNetworkAddress[this.host] = {};
    startingExclusions.byNetworkAddress[this.host][this.ports.http] = true;

    return Object.keys(this.peers).reduce((exclude: INetworkExcludeContainer, peerType) => {
      const peersByType = this.peers[peerType];

      peersByType.forEach((peer) => {
        exclude.byMoniker[peer.moniker] = true;
        exclude.byNetworkAddress[peer.host] = exclude.byNetworkAddress[peer.host] || {};
        const hostPeers = exclude.byNetworkAddress[peer.host];
        const httpProtocol = peer.protocols.filter((protocol) => {
          return protocol.type === NetworkProtocol.HTTP || protocol.type === NetworkProtocol.HTTPS;
        });

        if (httpProtocol.length === 0) {
          return;
        }

        hostPeers[httpProtocol[0].port] = true;
      });

      return exclude;
    }, startingExclusions);
  }

  private addHTTPRoutes() {
    this.log(`addHttpRoutes`);

    /**
     * Expose http route @ GET /xyo-status
     */
    this.httpServer.get(`/xyo-status`, (req: Request, res: Response, next: NextFunction) => {
      if (!this.isDiscoverable) {
        return next();
      }

      return res.status(200).json(this.getPingPayload());
    });
  }

  private getPingPayload(): IDiscoverable {
    return {
      moniker: this.moniker,
      host: this.host,
      type: this.getType(),
      protocols: [{
        type: NetworkProtocol.SOCKET,
        port: this.ports.socket
      }, {
        type: NetworkProtocol.HTTP,
        port: this.ports.http
      }],
      peers: this.peers
    };
  }
  /**
   * Socket handler for incoming socket communications
   * @param socket The socket to listen on
   */

  private async onSocketIn(socket: Socket) {
    this.log(`onSocketIn`);
    let data = new Buffer([]);

    socket.on(`data`, (chunk) => {
      data = Buffer.concat([data, chunk]);
    });

    socket.on('end', async () => {
      const decoder = new BitStreamDecoder(data);
      decoder.decode();
      this.logger.info(decoder.decode().toString());
    });

    return;
  }

  private onPeerDiscovered(peer: IDiscoverable) {
    this.log(`onPeerDiscovered`, peer);
    this.addPeer(peer);
  }

  private log(formatter: any, ...args: any[]): void {
    debug(`${this.moniker}: `, formatter, ...args); // Context specific logging
  }

  private addPeer(peer: IDiscoverable) {
    this.log(`onPeerDiscovered`, peer);

    const peersByType = this.peers[peer.type] || [];
    peersByType.push(peer);
    this.peers[peer.type] = peersByType;
  }
}

export default XYONode;

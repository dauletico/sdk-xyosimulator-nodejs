/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 2nd August 2018 10:47:41 am
 * @Email: developer@xyfindables.com
 * @Filename: xyo-node.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 13th August 2018 1:40:25 pm
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
    this.httpServer = express();
    this.httpServer.listen(this.ports.http);

    /**
     * A type safe way of initializing peers object.
     * Initialize peers object by iterating through component types.
     */
    this.peers = Object.keys(XYOComponentType).reduce((memo: {[s: string]: IDiscoverable[]}, value) => {
      memo[value] = [];
      return memo;
    }, {});

    this.addHTTPRoutes();

    this.socketServer = net.createServer(this.onSocketIn.bind(this));
    this.socketServer.listen(this.ports.socket);
  }

  public async discoverOtherNodesOnSubnet(discoveryType: DISCOVERY_TYPE): Promise<void> {
    this.log(`discoverOtherNodesOnSubnet`);
    this.nodeDiscoveryService.onPeerDiscovered(this.onPeerDiscovered.bind(this));

    /**
     * Build exclusion container. At this point, it should only be this node
     */
    const portExclude: { [s: string]: boolean } = {};
    const exclude: INetworkExcludeContainer = {};
    portExclude[this.ports.http] = true;
    exclude[this.host] = portExclude;

    this.nodeDiscoveryService.discoverPeers(discoveryType, exclude, this.maxPeers);
  }

  public getType(): XYOComponentType {
    return XYOComponentType.XYONode;
  }

  private addHTTPRoutes() {
    this.log(`addHttpRoutes`);

    this.httpServer.get(`/xyo-ping`, (req: Request, res: Response, next: NextFunction) => {
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

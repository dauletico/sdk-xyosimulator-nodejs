import debugLib from 'debug';
import XYOBase from '../xyo-base';
import { default as express, Express, Request, Response, NextFunction } from 'express';
import { default as net, Server, Socket } from 'net';
import http from 'http';
import { PortsContainer } from '../utils/ports-container';
import { NodeDiscoveryService, DISCOVERY_TYPE } from '../services/node-discovery.service';

const debug = debugLib('Node');

export class XYONode extends XYOBase {

  /** Our http server we will be servicing requests on */
  private httpServer: Express;

  /** Our socket server where we will communicating to other nodes on */
  private socketServer: Server;

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
    private readonly nodeDiscoveryService: NodeDiscoveryService
  ) {
    super();
    this.log(`constructor`);
    this.httpServer = express();
    this.httpServer.listen(this.ports.http);
    this.addHTTPRoutes();

    this.socketServer = net.createServer(this.onSocketIn.bind(this));
    this.socketServer.listen(this.ports.socket);
  }

  public async discoverOtherNodesOnSubnet(discoveryType: DISCOVERY_TYPE): Promise<void> {
    this.log(`discoverOtherNodesOnSubnet`);
    const otherNodes = await this.nodeDiscoveryService.discoverPeers(discoveryType);
  }

  /**
   * Get the current subnet address
   *
   * @returns The current subnet address
   */

  private async getMySubnetAddress(): Promise<string> {
    return `10.30.10.165`; // TODO make dynamic
  }

  private addHTTPRoutes() {
    this.log(`addHttpRoutes`);

    this.httpServer.get(`/xyo-ping`, (req: Request, res: Response, next: NextFunction) => {
      if (!this.isDiscoverable) {
        return next();
      }

      return res.status(200).json({
        moniker: this.moniker,
        type: `XYONode`,
        pipe: this.ports.socket
      });
    });
  }
  /**
   * Socket handler for incoming socket communications
   * @param socket The socket to listen on
   */

  private async onSocketIn(socket: Socket) {
    this.log(`onSocketIn`);
    return;
  }

  private log(formatter: any, ...args: any[]): void {
    debug(`${this.moniker}: `, formatter, ...args); // Context specific logging
  }
}

export default XYONode;

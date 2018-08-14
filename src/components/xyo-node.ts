/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 2nd August 2018 10:47:41 am
 * @Email: developer@xyfindables.com
 * @Filename: xyo-node.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 14th August 2018 2:18:44 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IDiscoverable } from '../types';
import XYOBase from '../xyo-base';
import { default as express, Express, Request, Response, NextFunction } from 'express';
import { default as net, Server, Socket } from 'net';
import { BitStreamDecoder } from '../utils/bit-stream-decoder';
import Logger from '../logger';
import { XYOComponentType } from './xyo-component-type.enum';
import { DiscoveryDelegate } from '../services/discovery-delegate';

export class XYONode extends XYOBase {
  /** If true, will continue run run-loop */
  public doLoop: boolean = false;

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
    public readonly httpPort: number,
    public readonly socketPort: number,
    public readonly isDiscoverable: boolean,
    private readonly discoveryDelegate: DiscoveryDelegate,
    private readonly logger: Logger
  ) {
    super();
    this.debug(`constructor`);
    this.httpServer = express();
    this.httpServer.listen(this.httpPort);
    this.addHTTPRoutes();
    this.socketServer = net.createServer(this.onSocketIn.bind(this));
    this.socketServer.listen(this.socketPort);
  }

  public getType(): XYOComponentType {
    return XYOComponentType.XYONode;
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
    this.debug(`Loop`);
    if (this.doLoop) {
      await this.discoveryDelegate.startDiscovering();
    }

    setTimeout(() => {
      this.loop();
    }, 1000);
  }

  private addHTTPRoutes() {
    this.debug(`addHttpRoutes`);

    /**
     * Expose http route @ GET /xyo-status
     */
    this.httpServer.get(`/xyo-status`, async (req: Request, res: Response, next: NextFunction) => {
      if (!this.isDiscoverable) {
        return next();
      }

      return res.status(200).json(await this.getXYOStatusPayload());
    });
  }

  private async getXYOStatusPayload(): Promise<IDiscoverable> {
    return {
      moniker: this.moniker,
      host: this.host,
      type: this.getType(),
      socketPort: this.httpPort,
      httpPort: this.socketPort,
      peers: await this.discoveryDelegate.getPeersByType(true)
    };
  }
  /**
   * Socket handler for incoming socket communications
   * @param socket The socket to listen on
   */

  private async onSocketIn(socket: Socket) {
    this.debug(`onSocketIn`);
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
}

export default XYONode;

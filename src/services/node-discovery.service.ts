/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Friday, 3rd August 2018 12:42:26 pm
 * @Email: developer@xyfindables.com
 * @Filename: node-discovery.service.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 13th August 2018 1:39:09 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { NetworkHelperService } from './network-helper.service';
import http from 'http';
import { IDiscoverable, INetworkExcludeContainer } from '../types';
import debugLib from 'debug';
import { EventEmitter } from 'events';

const debug = debugLib('NodeDiscoveryService');

export class NodeDiscoveryService extends EventEmitter {

  constructor(
    private readonly networkHelperService: NetworkHelperService,
    private readonly portRange: number[]
  ) {
    super();
  }

  public async discoverPeers(
    discoveryType: DISCOVERY_TYPE,
    exclude: INetworkExcludeContainer,
    maxPeers: number
  ): Promise<IDiscoverable[]> {
    debug(`discoverPeers`, discoveryType);
    switch (discoveryType) {
      case DISCOVERY_TYPE.LOCALHOST:
        return this.findLocalPeers(exclude, maxPeers);
      case DISCOVERY_TYPE.SUBNET:
        return this.findPeersOnSameSubnet(exclude, maxPeers);
      case DISCOVERY_TYPE.REMOTE:
        throw new Error(`DISCOVERY_TYPE.REMOTE: Not yet implemented`);
      default:
        throw new Error(`A discoveryType must be specified`);
    }
  }

  public async findLocalPeers(exclude: INetworkExcludeContainer, maxPeers: number): Promise<IDiscoverable[]> {
    debug(`findLocalPeers`);
    return this.findPeersOnIP('127.0.0.1', exclude, maxPeers);
  }

  public async findPeersOnSameSubnet(exclude: INetworkExcludeContainer, maxPeers: number): Promise<IDiscoverable[]> {
    debug(`findPeersOnSameSubnet`);
    const myIP = this.networkHelperService.getLocalIPAddress();

    if (!myIP) {
      throw new Error(`Could not find an ip address`);
    }

    return this.findPeersOnIP(myIP, exclude, maxPeers);
  }

  public async findPeersOnIP(
    ip: string,
    exclude: INetworkExcludeContainer,
    maxPeers: number
  ): Promise<IDiscoverable[]> {
    debug(`findPeersOnIP`, this.portRange, ip, exclude);

    /*
     * A serialized way of find iterating through candidates.
     * This could be done in parallel with a bit of effort
     * Iterates through candidates, tests to see if they are a nodes, and if so adds them to the node-list
     */

    return this.portRange.reduce(async (promiseChain, discoveryCandidate) => {
      debug(`PortRangeReducer`);

      const existingNodes = await promiseChain; // get current list

      // Test to see if probeAddress is excluded or if max peers have been reached
      if (
        (exclude && exclude[ip] && exclude[ip][discoveryCandidate]) ||
        existingNodes.length >= maxPeers
      ) {
        return existingNodes;
      }

      const discoverInterfaceCandidate = await this.probeAddress(ip, discoveryCandidate); // test if candidate is a node

      if (discoverInterfaceCandidate) { // if it is a node append it to list
        debug(`Found a node on the network: ${discoveryCandidate.toString()}\n`);
        existingNodes.push(discoverInterfaceCandidate); // Make a copy and add it to list
        this.emit(`peerDiscovered`, discoverInterfaceCandidate);
      } else {
        debug(`Node not found on the network: ${discoveryCandidate.toString()}\n`);
      }

      return existingNodes;
    }, Promise.resolve([]) as Promise<IDiscoverable[]>);
  }

  public onPeerDiscovered(listener: (peer: IDiscoverable) => void): void {
    this.on(`peerDiscovered`, listener);
  }

  /**
   * Test to see if an address is an xyo-node
   *
   * @param ip The subnetAddress to test
   * @param port The port of the subnetAddress to test
   * @return returns true if the address is an xyo-node, false otherwise
   */

  private async probeAddress(ip: string, port: number): Promise<IDiscoverable|null> {
    debug(`probeAddress`);

    return new Promise((resolve, reject) => {
      const request = http.get({
        hostname: ip,
        port,
        path: '/xyo-ping',
        agent: false
      }, (response) => {
        if (response.statusCode !== 200) { // TODO make more robust
          return resolve(null);
        }

        let body = '';

        response.on('data', (chunk: string) => {
          body += chunk;
        });

        response.on('end', () => {
          return resolve(this.validateProbeResponseBody(body));
        });
      });

      request.on('error', (error: Error & {code?: string}) => {
        // This just means nothing was servicing requests from that port. We can handle this
        if (error.code && error.code === 'ECONNREFUSED') {
          return resolve(null);
        }

        // All other errors we do not know how to handle at this point.
        return reject(error);
      });
    }) as Promise<IDiscoverable|null>;
  }

  private validateProbeResponseBody(body: string): IDiscoverable | null {
    debug(`validateProbeResponseBody`);

    try {
      const jsonBody = JSON.parse(body);

      if (
        typeof jsonBody === 'object' &&
        jsonBody.hasOwnProperty('moniker') &&
        jsonBody.hasOwnProperty('host') &&
        jsonBody.hasOwnProperty('type') &&
        jsonBody.hasOwnProperty('protocols') &&
        jsonBody.hasOwnProperty('peers')
      ) {
        return jsonBody;
      }

      return null;
    } catch (error) {
      // Could not parse payload, not an xyo-node
      return null;
    }
  }
}

export default NodeDiscoveryService;

export enum DISCOVERY_TYPE {
  LOCALHOST,
  SUBNET,
  REMOTE
}

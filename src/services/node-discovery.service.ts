import { NetworkHelperService } from './network-helper.service';
import http from 'http';
import { IDiscoverableInterface } from '../types';
import debugLib from 'debug';

const debug = debugLib('NodeDiscoveryService');

export class NodeDiscoveryService {

  constructor(
    private readonly networkHelperService: NetworkHelperService,
    private readonly portRange: number[]
  ) {}

  public async discoverPeers(discoveryType: DISCOVERY_TYPE): Promise<IDiscoverableInterface[]> {
    switch (discoveryType) {
      case DISCOVERY_TYPE.LOCALHOST:
        return this.findLocalPeers();
      case DISCOVERY_TYPE.SUBNET:
        return this.findPeersOnSameSubnet();
      case DISCOVERY_TYPE.REMOTE:
        throw new Error(`DISCOVERY_TYPE.REMOTE: Not yet implemented`);
      default:
        throw new Error(`A discoveryType must be specified`);
    }
  }

  public async findLocalPeers(): Promise<IDiscoverableInterface[]> {
    return this.findPeersOnIP('127.0.0.1');
  }

  public async findPeersOnSameSubnet(): Promise<IDiscoverableInterface[]> {
    const myIP = this.networkHelperService.getLocalIPAddress();

    if (!myIP) {
      throw new Error(`Could not find an ip address`);
    }

    return this.findPeersOnIP(myIP);
  }

  public async findPeersOnIP(ip: string, ...exclusions: number[]): Promise<IDiscoverableInterface[]> {

    /*
     * A serialized way of find iterating through candidates.
     * This could be done in parallel with a bit of effort
     * Iterates through candidates, tests to see if they are a nodes, and if so adds them to the node-list
     */

    return this.portRange.reduce(async (promiseChain, discoveryCandidate) => {
      const existingNodes = await promiseChain; // get current list
      const discoverInterfaceCandidate = await this.probeAddress(ip, discoveryCandidate); // test if candidate is a node

      if (discoverInterfaceCandidate) { // if it is a node append it to list
        debug(`Found a node on the network: \n${discoveryCandidate.toString()}\n`);
        existingNodes.push(discoverInterfaceCandidate); // Make a copy and add it to list
      } else {
        debug(`Node not found on the network: \n${discoveryCandidate.toString()}\n`);
      }

      return existingNodes;
    }, Promise.resolve([]) as Promise<IDiscoverableInterface[]>);
  }

  /**
   * Test to see if an address is an xyo-node
   *
   * @param ip The subnetAddress to test
   * @param port The port of the subnetAddress to test
   * @return returns true if the address is an xyo-node, false otherwise
   */

  private async probeAddress(ip: string, port: number): Promise<IDiscoverableInterface|null> {
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

        return resolve(null);
      });

      request.on('error', (error: Error & {code?: string}) => {
        // This just means nothing was servicing requests from that port. We can handle this
        if (error.code && error.code === 'ECONNREFUSED') {
          return resolve(null);
        }

        // All other errors we do not know how to handle at this point.
        return reject(error);
      });
    }) as Promise<IDiscoverableInterface|null>;
  }

  private validateProbeResponseBody(body: string): IDiscoverableInterface | null {
    try {
      const jsonBody = JSON.parse(body);

      if (
        typeof jsonBody === 'object' &&
        body.hasOwnProperty('moniker') &&
        body.hasOwnProperty('type') &&
        body.hasOwnProperty('pipe')
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

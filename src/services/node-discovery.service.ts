/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Friday, 3rd August 2018 12:42:26 pm
 * @Email: developer@xyfindables.com
 * @Filename: node-discovery.service.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 14th August 2018 2:18:14 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { NetworkHelperService } from './network-helper.service';
import http from 'http';
import { IDiscoverable, IKnownNode, INetworkAddress } from '../types';
import { EventEmitter } from 'events';
import _ from 'lodash';
import { PeersRepository } from '../data/peers.repository';
import { XYOBase } from '../xyo-base';

export class NodeDiscoveryService extends XYOBase {

  private readonly eventEmitter = new EventEmitter();

  constructor(
    private readonly networkHelperService: NetworkHelperService,
    private readonly portRange: number[],
    private readonly knownNodes: IKnownNode[],
    private readonly peersRepository: PeersRepository
  ) {
    super();
  }

  public async discoverPeers(
    discoveryType: DISCOVERY_TYPE,
    maxPeers: number
  ): Promise<IDiscoverable[]> {
    this.debug(`discoverPeers`, discoveryType);

    switch (discoveryType) {
      case DISCOVERY_TYPE.LOCALHOST:
        return this.findLocalPeers(maxPeers);
      case DISCOVERY_TYPE.SUBNET:
        return this.findPeersOnSameSubnet(maxPeers);
      case DISCOVERY_TYPE.REMOTE:
        return this.findPeersFromKnownNodes(maxPeers);
      default:
        throw new Error(`A discoveryType must be specified`);
    }
  }
  public async findLocalPeers(maxPeers: number): Promise<IDiscoverable[]> {
    this.debug(`findLocalPeers`);
    return this.findPeersOnHost('127.0.0.1', this.portRange, maxPeers);
  }

  public async findPeersOnSameSubnet(maxPeers: number): Promise<IDiscoverable[]> {
    this.debug(`findPeersOnSameSubnet`);
    const myIP = this.networkHelperService.getLocalIPAddress();

    if (!myIP) {
      throw new Error(`Could not find an ip address`);
    }

    return this.findPeersOnHost(myIP, this.portRange, maxPeers);
  }

  public async findPeersFromList(addresses: INetworkAddress[], maxPeers: number): Promise<IDiscoverable[]> {
    this.debug(`findPeersFromList`);

    return addresses.reduce(async (promiseChain: Promise<IDiscoverable[]>, address: INetworkAddress) => {
      const discoverables = await promiseChain;
      const newDiscoverables = await this.findPeersOnHost(address.host, address.port, maxPeers);
      return _.concat([], discoverables, newDiscoverables);
    }, Promise.resolve([]));
  }

  public async findPeersOnHost(
    host: string,
    ports: number[] | number,
    maxPeers: number
  ): Promise<IDiscoverable[]> {
    const portRange = _.castArray(ports);
    this.debug(`findPeersOnIP`, portRange, host);

    /*
     * A serialized way of find iterating through candidates.
     * This could be done in parallel with a bit of effort
     * Iterates through candidates, tests to see if they are a nodes, and if so adds them to the node-list
     */

    return portRange.reduce(async (promiseChain, discoveryCandidate) => {
      this.debug(`PortRangeReducer`);

      const existingNodes = await promiseChain; // get current list

      if (existingNodes.length >= maxPeers) {
        return existingNodes;
      }

      const shouldExcludeNetworkAddress = await this.peersRepository.shouldExcludePeerExistWithNetworkAddress(
        host,
        discoveryCandidate
      );

      if (shouldExcludeNetworkAddress) {
        return existingNodes;
      }

      const discoverInterfaceCandidate = await this.probeAddress(host, discoveryCandidate);
      if (!discoverInterfaceCandidate) {
        return existingNodes;
      }

      const shouldExcludeMoniker = await this.peersRepository.shouldExcludePeerWithMoniker(
        discoverInterfaceCandidate.moniker
      );
      if (shouldExcludeMoniker) {
        return existingNodes;
      }

      existingNodes.push(discoverInterfaceCandidate);
      this.eventEmitter.emit(`peer:discovered`, discoverInterfaceCandidate);

      return existingNodes;
    }, Promise.resolve([]) as Promise<IDiscoverable[]>);
  }

  public onPeerDiscovered(listener: (peer: IDiscoverable) => void): void {
    this.eventEmitter.on(`peer:discovered`, listener);
  }

  private async findPeersFromKnownNodes(
    maxPeers: number
  ): Promise<IDiscoverable[]> {
    this.debug(`findPeersFromKnownNodes`);

    return this.knownNodes.reduce(async (promiseChain: Promise<IDiscoverable[]>, knownDomain: IKnownNode) => {
      const discoverables = await promiseChain;
      const newDiscoverables = await this.findPeersOnHost(knownDomain.hostname, knownDomain.port, maxPeers);
      return _.concat([], discoverables, newDiscoverables);
    }, Promise.resolve([]));
  }

  /**
   * Test to see if an address is an xyo-node
   *
   * @param ip The subnetAddress to test
   * @param port The port of the subnetAddress to test
   * @return returns true if the address is an xyo-node, false otherwise
   */

  private async probeAddress(hostname: string, port: number): Promise<IDiscoverable|null> {
    this.debug(`probeAddress`);

    return new Promise((resolve, reject) => {
      const request = http.get({
        hostname,
        port,
        path: '/xyo-status',
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
    this.debug(`validateProbeResponseBody`);

    try {
      const jsonBody = JSON.parse(body);

      if (
        typeof jsonBody === 'object' &&
        jsonBody.hasOwnProperty('moniker') &&
        jsonBody.hasOwnProperty('host') &&
        jsonBody.hasOwnProperty('type') &&
        jsonBody.hasOwnProperty('httpPort') &&
        jsonBody.hasOwnProperty('socketPort') &&
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

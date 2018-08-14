/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 13th August 2018 4:35:13 pm
 * @Email:  developer@xyfindables.com
 * @Filename: peers.repository.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 14th August 2018 1:15:25 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IDiscoverableIndex, IDiscoverable, INetworkAddress } from '../types';
import _ from 'lodash';
import XYOBase from '../xyo-base';

export class PeersRepository extends XYOBase implements IPeersRepository {
  public index: IDiscoverableIndex = {
    byMoniker: {},
    byNetworkAddress: {},
    byType: {
      'xyo-node': [],
      'xyo-sentinel': [],
      'xyo-bridge': [],
      'xyo-archivist': [],
      'xyo-diviner': []
    }
  };

  private readonly peers: IDiscoverable[] = [];

  constructor(
    private readonly maxPeers: number,
    private readonly excludeMoniker: string,
    private readonly excludeAddresses: INetworkAddress[]
  ) {
    super();
  }

  public async shouldExcludePeerWithMoniker(moniker: string): Promise<boolean> {
    return this.index.byMoniker[moniker] || this.excludeMoniker === moniker;
  }

  public async shouldExcludePeerExistWithNetworkAddress(host: string, httpPort: number): Promise<boolean> {
    const inIndex = this.index.byNetworkAddress[host] && this.index.byNetworkAddress[host][httpPort];
    if (inIndex) {
      return true;
    }

    return _.filter(this.excludeAddresses, { host, port: httpPort }).length > 0;
  }

  public async getPeerCount(): Promise<number> {
    return this.peers.length;
  }

  public async tryAddPeer(peer: IDiscoverable): Promise<void> {
    if (await this.shouldExcludePeerWithMoniker(peer.moniker)) {
      throw new Error(`Can not add peer with moniker ${peer.moniker}. Already exists`);
    }

    if (await this.shouldExcludePeerExistWithNetworkAddress(peer.host, peer.httpPort)) {
      throw new Error(`Can not add peer with host:port ${peer.host}:${peer.httpPort}. Already exists`);
    }

    this.peers.push(peer);

    this.index.byMoniker[peer.moniker] = true;
    this.index.byNetworkAddress[peer.host] = this.index.byNetworkAddress[peer.host] || {};
    this.index.byNetworkAddress[peer.host][peer.httpPort] = true;
    this.index.byType[peer.type].push(peer);
  }

  public async getPeers(): Promise<IDiscoverable[]> {
    return this.peers;
  }

  public async getPeersByType(): Promise<{[s: string]: IDiscoverable[]}> {
    return this.index.byType;
  }
}

export interface IPeersRepository {
  shouldExcludePeerWithMoniker(moniker: string): Promise<boolean>;
  shouldExcludePeerExistWithNetworkAddress(host: string, httpPort: number): Promise<boolean>;
  getPeerCount(): Promise<number>;
  tryAddPeer(peer: IDiscoverable): Promise<void>;
  getPeers(): Promise<IDiscoverable[]>;
  getPeersByType(): Promise<{[s: string]: IDiscoverable[]}>;
}

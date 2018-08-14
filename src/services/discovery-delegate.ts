/*
* @Author: XY | The Findables Company <ryanxyo>
* @Date:   Monday, 13th August 2018 5:01:31 pm
* @Email:  developer@xyfindables.com
* @Filename: discovery-delegate.ts
* @Last modified by: ryanxyo
* @Last modified time: Monday, 13th August 2018 5:01:33 pm
* @License: All Rights Reserved
* @Copyright: Copyright XY | The Findables Company
*/

import NodeDiscoveryService, { DISCOVERY_TYPE } from './node-discovery.service';
import { IPeersRepository } from '../data/peers.repository';
import { IDiscoverable } from '../types';
import _ from 'lodash';

export class DiscoveryDelegate {
  constructor(
    private readonly nodeDiscoveryService: NodeDiscoveryService,
    private readonly peersRepository: IPeersRepository,
    private readonly maxPeers: number
  ) {
    this.nodeDiscoveryService.onPeerDiscovered(this.onPeerDiscovered.bind(this));
  }

  public async startDiscovering() {
    if (await this.peersRepository.getPeerCount() >= this.maxPeers) {
      return;
    }

    await this.discoverPeers(DISCOVERY_TYPE.LOCALHOST);
    if (await this.peersRepository.getPeerCount() >= this.maxPeers) {
      return;
    }

    await this.discoverPeers(DISCOVERY_TYPE.SUBNET);
    if (await this.peersRepository.getPeerCount() >= this.maxPeers) {
      return;
    }

    await this.discoverPeers(DISCOVERY_TYPE.REMOTE);
    if (await this.peersRepository.getPeerCount() >= this.maxPeers) {
      return;
    }
  }

  public getPeers(): Promise<IDiscoverable[]> {
    return this.peersRepository.getPeers();
  }

  public async getPeersByType(prunePeersOfPeers: boolean = false): Promise<{[s: string]: IDiscoverable[]}> {
    const peersByType = await this.peersRepository.getPeersByType();
    if (!prunePeersOfPeers) {
      return peersByType;
    }

    /**
     * We want to prune peers at a depth level of 1 since that can grow
     * very big
     */

    const peersByTypeCopy = _.cloneDeep(peersByType);

    Object.keys(peersByTypeCopy).forEach((componentTypeKey) => {
      peersByTypeCopy[componentTypeKey].forEach((componentTypeItem) => {
        Object.keys(componentTypeItem.peers).forEach((innerComponentTypeKey) => {
          componentTypeItem.peers[innerComponentTypeKey] = [];
        });
      });
    });

    return peersByTypeCopy;
  }

  private async discoverPeers(discoveryType: DISCOVERY_TYPE): Promise<void> {
    await this.nodeDiscoveryService.discoverPeers(
      discoveryType,
      this.maxPeers
    );

    return;
  }

  private onPeerDiscovered(peer: IDiscoverable) {
    // this.log(`onPeerDiscovered`, peer);
    this.addPeer(peer);
  }

  private addPeer(peer: IDiscoverable) {
    // this.log(`onPeerDiscovered`, peer);
    return this.peersRepository.tryAddPeer(peer);
  }
}

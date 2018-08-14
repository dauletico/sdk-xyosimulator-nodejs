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
import { XYOBase } from '../xyo-base';

export class DiscoveryDelegate extends XYOBase {
  private static readonly POTENTIAL_PEER_QUEUE_MAX_SIZE = 100;

  private readonly potentialPeerQueue: { queue: IDiscoverable[], byMoniker: {[s: string]: boolean}} = {
    queue: [],
    byMoniker: {}
  };

  constructor(
    private readonly nodeDiscoveryService: NodeDiscoveryService,
    private readonly peersRepository: IPeersRepository,
    private readonly maxPeers: number
  ) {
    super();
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

    const discoveryCandidates = this.getDiscoveryCandidateFromQueue(true);
    if (discoveryCandidates.length > 0) {
      await this.nodeDiscoveryService.findPeersFromList(discoveryCandidates, this.maxPeers);
    }
  }

  public addDiscoveryCandidateToQueue(candidate: IDiscoverable): boolean {
    if (
      this.potentialPeerQueue.queue.length < DiscoveryDelegate.POTENTIAL_PEER_QUEUE_MAX_SIZE &&
      !this.potentialPeerQueue.byMoniker[candidate.moniker]
    ) {
      this.potentialPeerQueue.queue.push(candidate);
      this.potentialPeerQueue.byMoniker[candidate.moniker] = true;
      return true;
    }

    return false;
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

  private getDiscoveryCandidateFromQueue(clearQueue: boolean = false) {
    const candidates = this.potentialPeerQueue.queue.map((queueItem) => {
      return {
        host: queueItem.host,
        port: queueItem.httpPort
      };
    });

    if (clearQueue) {
      this.potentialPeerQueue.queue = [];
      this.potentialPeerQueue.byMoniker = {};
    }

    return candidates;
  }

  private async discoverPeers(discoveryType: DISCOVERY_TYPE): Promise<void> {
    await this.nodeDiscoveryService.discoverPeers(
      discoveryType,
      this.maxPeers
    );

    return;
  }

  private async onPeerDiscovered(peer: IDiscoverable) {
    /**
     * Adds indirect peers to peer queue if the queue is not full
     * and the indirect peer is already not in the queue
     */
    if (this.potentialPeerQueue.queue.length < DiscoveryDelegate.POTENTIAL_PEER_QUEUE_MAX_SIZE) {
      _.each(peer.peers, (peerCollection: IDiscoverable[]) => {
        peerCollection.forEach(this.addDiscoveryCandidateToQueue.bind(this));
      });
    }

    this.addPeer(peer);
  }

  private addPeer(peer: IDiscoverable) {
    // this.log(`onPeerDiscovered`, peer);
    return this.peersRepository.tryAddPeer(peer);
  }
}

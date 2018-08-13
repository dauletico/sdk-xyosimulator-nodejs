/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 13th August 2018 12:51:20 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node-initialize-type-mapper.ts
 * @Last modified by:
 * @Last modified time:
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOComponentType } from '../components/xyo-component-type.enum';
import NodeDiscoveryService from '../services/node-discovery.service';
import { XYONode } from '../components/xyo-node';
import Logger from '../logger';
import { XYOArchivist } from '../components/xyo-archivist';
import { XYOSentinel } from '../components/xyo-sentinel';
import { XYOBridge } from '../components/xyo-bridge';
import { XYODiviner } from '../components/xyo-diviner';

export function tryCreateNodeFromComponentType(
  type: XYOComponentType
): XYONodeInitializer {
  switch (type) {
    case XYOComponentType.XYOArchivist:
      return (
        moniker: string,
        host: string,
        httpPort: number,
        socketPort: number,
        isDiscoverable: boolean,
        maxPeers: number,
        nodeDiscoveryService: NodeDiscoveryService,
        logger: Logger
      ) => {
        return new XYOArchivist(
          moniker,
          host,
          {
            http: httpPort,
            socket: socketPort
          },
          isDiscoverable,
          maxPeers,
          nodeDiscoveryService,
          logger
        );
      };

    case XYOComponentType.XYOSentinel:
      return (
        moniker: string,
        host: string,
        httpPort: number,
        socketPort: number,
        isDiscoverable: boolean,
        maxPeers: number,
        nodeDiscoveryService: NodeDiscoveryService,
        logger: Logger
      ) => {
        return new XYOSentinel(
          moniker,
          host,
          {
            http: httpPort,
            socket: socketPort
          },
          isDiscoverable,
          maxPeers,
          nodeDiscoveryService,
          logger
        );
      };

    case XYOComponentType.XYOBridge:
      return (
        moniker: string,
        host: string,
        httpPort: number,
        socketPort: number,
        isDiscoverable: boolean,
        maxPeers: number,
        nodeDiscoveryService: NodeDiscoveryService,
        logger: Logger
      ) => {
        return new XYOBridge(
          moniker,
          host,
          {
            http: httpPort,
            socket: socketPort
          },
          isDiscoverable,
          maxPeers,
          nodeDiscoveryService,
          logger
        );
      };

    case XYOComponentType.XYODiviner:
      return (
      moniker: string,
      host: string,
      httpPort: number,
      socketPort: number,
      isDiscoverable: boolean,
      maxPeers: number,
      nodeDiscoveryService: NodeDiscoveryService,
      logger: Logger
      ) => {
        return new XYODiviner(
          moniker,
          host,
          {
            http: httpPort,
            socket: socketPort
          },
          isDiscoverable,
          maxPeers,
          nodeDiscoveryService,
          logger
        );
      };
    default:
      throw new Error(`Could not map type ${type} to an XYONode type`);
  }
}

export type XYONodeInitializer = (
  moniker: string,
  host: string,
  httpPort: number,
  socketPort: number,
  isDiscoverable: boolean,
  maxPeers: number,
  nodeDiscoveryService: NodeDiscoveryService,
  logger: Logger
) => XYONode;

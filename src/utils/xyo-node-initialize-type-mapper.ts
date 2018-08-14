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
import { XYONode } from '../components/xyo-node';
import Logger from '../logger';
import { XYOArchivist } from '../components/xyo-archivist';
import { XYOSentinel } from '../components/xyo-sentinel';
import { XYOBridge } from '../components/xyo-bridge';
import { XYODiviner } from '../components/xyo-diviner';
import { DiscoveryDelegate } from '../services/discovery-delegate';

export function tryCreateNodeFromComponentType(type: XYOComponentType): XYONodeInitializer {
  switch (type) {
    case XYOComponentType.XYOArchivist:
      return (
        moniker: string,
        host: string,
        httpPort: number,
        socketPort: number,
        isDiscoverable: boolean,
        discoveryDelegate: DiscoveryDelegate,
        logger: Logger
      ) => {
        return new XYOArchivist(
          moniker,
          host,
          httpPort,
          socketPort,
          isDiscoverable,
          discoveryDelegate,
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
        discoveryDelegate: DiscoveryDelegate,
        logger: Logger
      ) => {
        return new XYOSentinel(
          moniker,
          host,
          httpPort,
          socketPort,
          isDiscoverable,
          discoveryDelegate,
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
        discoveryDelegate: DiscoveryDelegate,
        logger: Logger
      ) => {
        return new XYOBridge(
          moniker,
          host,
          httpPort,
          socketPort,
          isDiscoverable,
          discoveryDelegate,
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
        discoveryDelegate: DiscoveryDelegate,
        logger: Logger
      ) => {
        return new XYODiviner(
          moniker,
          host,
          httpPort,
          socketPort,
          isDiscoverable,
          discoveryDelegate,
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
  discoveryDelegate: DiscoveryDelegate,
  logger: Logger
) => XYONode;

/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 2nd August 2018 10:52:05 am
 * @Email: developer@xyfindables.com
 * @Filename: index.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 13th August 2018 10:30:23 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { PortsContainer } from "../utils/ports-container";
import { NetworkProtocol } from "../utils/network-protocol.enum";
import { XYOComponentType } from "../components/xyo-component-type.enum";

export interface IConfig {
  nodes: INodesConfig
}

export interface INodesConfig {
  discovery: IDiscoveryConfig;
}

export interface IDiscoveryConfig {
  subnet: ISubnetConfig
}

export interface ISubnetConfig {
  ports: IPortsConfig[]
}

/** Create an alias to reduce coupling */
export type IPortsConfig = PortsContainer;

export interface IDiscoverable {
  moniker: string;
  host: string;
  type: XYOComponentType;
  protocols: {
    type: NetworkProtocol
    port: number
  }[];
  peers: {[s: string]: IDiscoverable[]}
}
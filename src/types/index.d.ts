/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 2nd August 2018 10:52:05 am
 * @Email: developer@xyfindables.com
 * @Filename: index.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 14th August 2018 2:13:26 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

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
  ports: string[]
}

export interface IKnownNode {
  hostname: string;
  port: number;
}

export interface IDiscoverable {
  moniker: string;
  host: string;
  type: XYOComponentType;
  httpPort: number;
  socketPort: number;
  peers: {[s: string]: IDiscoverable[]}
}

export interface IDiscoverableIndex {
  byNetworkAddress: {
    [host: string]: { [port: string]: boolean };
  },
  byMoniker: {
    [moniker: string]: boolean;
  },
  byType: {
    [s: string]: IDiscoverable[]
  }
}

export interface INetworkAddress {
  host: string, 
  port: number
}
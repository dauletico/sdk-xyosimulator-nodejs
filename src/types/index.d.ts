import { PortsContainer } from "../utils/ports-container";

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

export interface IDiscoverableInterface {
  protocols:[{
    type: NetworkProtocol
    ip?: number;
    domain?: string;
    port?: number
  }],
  // peers, etc. any other information that is useful to share
}

export enum NetworkProtocol {
  SOCKET,
  HTTP,
  HTTPS
}


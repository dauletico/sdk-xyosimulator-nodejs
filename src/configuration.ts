import config from 'config';
import { IPortsConfig } from './types';
import { PortsContainer } from './utils/ports-container';

const portsList = config.get('xyo.nodes.discovery.subnet.ports') as IPortsConfig[];

export const subnetPorts = portsList.map((subnetPort) => {
  return new PortsContainer(subnetPort.http, subnetPort.socket);
});

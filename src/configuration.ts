
/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 2nd August 2018 11:50:07 am
 * @Email: developer@xyfindables.com
 * @Filename: configuration.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 13th August 2018 10:30:23 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import config from 'config';
import { IPortsConfig } from './types';
import { PortsContainer } from './utils/ports-container';

const portsList = config.get('xyo.nodes.discovery.subnet.ports') as IPortsConfig[];

export const subnetPorts = portsList.map((subnetPort) => {
  return new PortsContainer(subnetPort.http, subnetPort.socket);
});

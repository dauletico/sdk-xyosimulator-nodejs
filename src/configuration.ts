
/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 2nd August 2018 11:50:07 am
 * @Email: developer@xyfindables.com
 * @Filename: configuration.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 13th August 2018 4:03:12 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import config from 'config';
import { IKnownNode } from './types';

export const subnetPorts = config.get('xyo.nodes.discovery.subnet.ports') as number[];
export const knownNodes = config.get('xyo.nodes.discovery.knownNodes') as IKnownNode[];

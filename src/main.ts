/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 2nd August 2018 8:43:04 am
 * @Email: developer@xyfindables.com
 * @Filename: main.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 13th August 2018 10:30:23 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

process.env.DEBUG = 'Node,NodeDiscoveryService'; // print debug messages for everything

import { XYONode } from './components/xyo-node';
import { NetworkHelperService } from './services/network-helper.service';
import { NodeDiscoveryService, DISCOVERY_TYPE } from './services/node-discovery.service';

import Logger from './logger';
import { XYOArchivist } from './components/xyo-archivist';
import { XYOBridge } from './components/xyo-bridge';
import { XYODiviner } from './components/xyo-diviner';

const logger = new Logger();

async function main() {
  logger.info(`Running main`);
  const networkHelperService = new NetworkHelperService();

  // const nodeDiscoveryService = new NodeDiscoveryService(
  //   networkHelperService,
  //   [15555, 15556, 15557, 15558, 15559, 15560]
  // );

  const node1 = new XYONode(
    'N1',
    '127.0.0.1',
    { http: 15555, socket: 19555 },
    true,
    new NodeDiscoveryService(networkHelperService, [15555, 15556, 15557, 15558, 15559, 15560]),
    logger
  );

  const node2 = new XYOArchivist(
    'A2', '127.0.0.1',
    { http: 15556, socket: 19556 },
    true,
    new NodeDiscoveryService(networkHelperService, [15555, 15556, 15557, 15558, 15559, 15560]),
    logger
  );

  const node3 = new XYOBridge(
    'B3',
    '127.0.0.1',
    { http: 15557, socket: 19557 },
    true,
    new NodeDiscoveryService(networkHelperService, [15555, 15556, 15557, 15558, 15559, 15560]),
    logger
  );

  const node4 = new XYODiviner(
    'D4',
    '127.0.0.1',
    { http: 15558, socket: 19558 },
    true,
    new NodeDiscoveryService(networkHelperService, [15555, 15556, 15557, 15558, 15559, 15560]),
    logger
  );

  /** Delay 5s so that servers can get up and going */
  setTimeout(() => {
    node1.discoverOtherNodesOnSubnet(DISCOVERY_TYPE.LOCALHOST);
    node2.discoverOtherNodesOnSubnet(DISCOVERY_TYPE.LOCALHOST);
    node3.discoverOtherNodesOnSubnet(DISCOVERY_TYPE.LOCALHOST);
    node4.discoverOtherNodesOnSubnet(DISCOVERY_TYPE.LOCALHOST);
  }, 2000);
}

main();

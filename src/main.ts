process.env.DEBUG = '*'; // print debug messages for everything

import { XYONode } from './components/xyo-node';
import { NetworkHelperService } from './services/network-helper.service';
import { NodeDiscoveryService, DISCOVERY_TYPE } from './services/node-discovery.service';

async function main() {
  const networkHelperService = new NetworkHelperService();
  const nodeDiscoveryService = new NodeDiscoveryService(networkHelperService, []);

  const node1 = new XYONode('N1', '127.0.0.1', { http: 15555, socket: 19555 }, true, nodeDiscoveryService);
  const node2 = new XYONode('N2', '127.0.0.1', { http: 15556, socket: 19556 }, true, nodeDiscoveryService);

  /** Delay 5s so that servers can get up and going */
  setTimeout(() => {
    node1.discoverOtherNodesOnSubnet(DISCOVERY_TYPE.LOCALHOST);
    node2.discoverOtherNodesOnSubnet(DISCOVERY_TYPE.LOCALHOST);
  }, 5000);
}

main();

/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 2nd August 2018 8:43:04 am
 * @Email: developer@xyfindables.com
 * @Filename: main.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 13th August 2018 1:46:56 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

process.env.DEBUG = 'Node,NodeDiscoveryService'; // print debug messages for everything

import { XYONode } from './components/xyo-node';
import { NetworkHelperService } from './services/network-helper.service';
import { NodeDiscoveryService, DISCOVERY_TYPE } from './services/node-discovery.service';

import Logger from './logger';

import program from 'commander';
import { XYOComponentType } from './components/xyo-component-type.enum';
import { tryCreateNodeFromComponentType } from './utils/xyo-node-initialize-type-mapper';

const logger = new Logger();

/**
 * Initializes an XYONode in the XYO Network
 *
 * @param moniker The name of the node
 * @param host The host network value for this node
 * @param httpPort What http port to listen on for this node
 * @param socketPort What socket port to listen on for this node
 * @param isDiscoverable If true, will make itself discoverable to other peers on the network
 */
async function init(
  type: XYOComponentType,
  moniker: string,
  host: string,
  httpPort: number,
  socketPort: number,
  isDiscoverable: boolean,
  maxPeers: number
) {
  logger.info(`
    ####################################

    Initializing
      type: ${type}
      Moniker: ${moniker}
      host: ${host}
      httpPort: ${httpPort}
      socketPort: ${socketPort}
      isDiscoverable: ${isDiscoverable}

    ####################################
  `);

  /**
   * This is composition root. We will initialize all the dependencies that are needed
   * and inject them via constructor to the consumers
   */

   // create network helper service
  const networkHelperService = new NetworkHelperService();

  // create nodeDiscoveryService
  const nodeDiscoveryService = new NodeDiscoveryService(
    networkHelperService,
    [15555, 15556, 15557, 15558, 15559, 15560]
  );

  // Given a XYOComponentType, get an initializer
  const xyoNodeInitializerFn = tryCreateNodeFromComponentType(type);

  // Create the node from the abstract initialization function
  const xyoNode: XYONode = xyoNodeInitializerFn(
    moniker,
    host,
    httpPort,
    socketPort,
    isDiscoverable,
    maxPeers,
    nodeDiscoveryService,
    logger
  );

  // Find other peers
  xyoNode.discoverOtherNodesOnSubnet(DISCOVERY_TYPE.LOCALHOST);
}

/**
 * Entry point to the application
 * @param args An array of options to our program
 */

function main(args: string[]) {
  program
    .version(`0.1.0`)
    .option('-t --type <type>', 'The type of XYO Node', /^(xyo-sentinel|xyo-bridge|xyo-archivist|xyo-diviner)$/i)
    .option('-m, --moniker <value>', 'The moniker of the XYONode to add to the XYO Network')
    .option('-h, --host <value>', 'The moniker of the XYONode to add to the XYO Network')
    .option('-p, --httpPort <value>', 'The moniker of the XYONode to add to the XYO Network', parseInt)
    .option('-s, --socketPort <value>', 'The moniker of the XYONode to add to the XYO Network', parseInt)
    .option('-n, --maxPeers <value>', 'The maximum number of peers the XYONode will try to find', parseInt)
    .option('-d, --isDiscoverable', 'The moniker of the XYONode to add to the XYO Network')
    .parse(args);

  /** Validation below. If a validation step fails, exit process with -1 code */

  if (!program.type) {
    logger.error(`A \`type\` option is required. Will exit`);
    program.help();
    process.exit(-1);
  }

  if (!program.moniker) {
    logger.error(`A \`moniker\` option is required. Will exit`);
    program.help();
    process.exit(-1);
  }

  if (!program.host) {
    logger.error(`A \`host\` option is required. Will exit`);
    program.help();
    process.exit(-1);
  }

  if (!program.httpPort) {
    logger.error(`A \`httpPort\` option is required. Will exit`);
    program.help();
    process.exit(-1);
  }

  if (!program.socketPort) {
    logger.error(`A \`socketPort\` option is required. Will exit`);
    program.help();
    process.exit(-1);
  }
  if (!program.maxPeers) {
    logger.error(`A \`maxPeers\` option is required. Will exit`);
    process.exit(-1);
  }

  if (program.isDiscoverable === undefined) {
    logger.error(`A \`isDiscoverable\` option is required. Will exit`);
    process.exit(-1);
  }

  init(
    program.type as XYOComponentType,
    program.moniker as string,
    program.host  as string,
    program.httpPort as number,
    program.socketPort as number,
    Boolean(program.isDiscoverable),
    program.maxPeers
  );
}

if (require.main) {
  main(process.argv);
}

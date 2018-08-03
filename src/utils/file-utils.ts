/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 9th August 2018 8:40:53 am
 * @Email: developer@xyfindables.com
 * @Filename: file-utils.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 13th August 2018 10:30:23 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { promisify } from 'util';
import fs from 'fs';
const logger = console;
const writeFile = promisify(fs.writeFile);

export async function writeBufferToFile(destination: string, buffer: Buffer): Promise<void> {
  try {
    return writeFile(destination, buffer);
  } catch (err) {
    logger.error(`There was an issue writing the buffer to file`, err);
    throw err;
  }
}

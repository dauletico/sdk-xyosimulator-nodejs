/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 9th August 2018 10:25:42 am
 * @Email: developer@xyfindables.com
 * @Filename: logger.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 14th August 2018 2:23:13 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { default as winston, Logger as WinstonLogger, TransportInstance } from 'winston';
class Logger extends WinstonLogger {

  constructor() {
    const transports: TransportInstance[] = [
      new winston.transports.Console({ level: 'debug' })
    ];

    super({ transports });
  }
}

export default Logger;

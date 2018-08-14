/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Friday, 3rd August 2018 12:51:22 pm
 * @Email: developer@xyfindables.com
 * @Filename: network-helper.service.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 14th August 2018 1:16:08 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { networkInterfaces } from 'os';
import { XYOBase } from '../xyo-base';

export class NetworkHelperService extends XYOBase {

  public getLocalIPAddress(): string | null {
    const networkMap = networkInterfaces();
    let localIP: string | null = null;

    for (const key in networkMap) {
      if (networkMap.hasOwnProperty(key)) {
        const networks = networkMap[key];

        for (let i = 0; i < networks.length; i = i + 1) { // tslint:disable-line:prefer-for-of
          const networkDetails = networks[i];
          if (networkDetails.family === 'IPv4' && !networkDetails.internal) {
            localIP = networkDetails.address;
            break;
          }
        }

        if (localIP) {
          break;
        }
      }
    }

    return localIP;
  }
}

export default NetworkHelperService;

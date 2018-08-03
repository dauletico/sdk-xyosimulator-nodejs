/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Friday, 3rd August 2018 9:10:59 am
 * @Email: developer@xyfindables.com
 * @Filename: ports-container.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 13th August 2018 10:30:23 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export class PortsContainer {
  public constructor(public readonly http: number, public readonly socket: number) {}

  public toString(): string {
    return JSON.stringify({
      http: this.http,
      socket: this.socket
    }, null, '\t');
  }
}

export default PortsContainer;

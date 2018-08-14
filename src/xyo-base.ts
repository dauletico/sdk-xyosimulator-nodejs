/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 2nd August 2018 10:50:50 am
 * @Email: developer@xyfindables.com
 * @Filename: xyo-base.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 14th August 2018 2:17:31 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
import { default as debugLib, IDebugger } from 'debug';
export class XYOBase {
  // tslint:disable-next-line:variable-name
  private readonly _debug: IDebugger;

  constructor() {
    this._debug = debugLib(this.constructor.name);
  }

  protected debug(formatter: any, ...args: any[]): void {
    this._debug(formatter, args); // Context specific logging
  }
}

export default XYOBase;

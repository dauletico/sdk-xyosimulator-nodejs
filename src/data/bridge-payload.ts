
/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 9th August 2018 11:13:15 am
 * @Email: developer@xyfindables.com
 * @Filename: bridge-payload.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 14th August 2018 1:14:52 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOBase } from '../xyo-base';

export class BridgePayload extends XYOBase {
  constructor(
    public readonly signingType: number,
    public readonly data: Buffer,
    public readonly currentPublicKey: Buffer,
    public readonly nextPublicKey: Buffer,
    public readonly currentSignature: Buffer,
    public readonly nextSignature: Buffer
  ) {
    super();
  }

  public toString(): string {
    return JSON.stringify({
      signingType: this.signingType,
      data: this.data,
      currentPublicKey: this.currentPublicKey,
      nextPublicKey: this.nextPublicKey,
      currentSignature: this.currentSignature,
      nextSignature: this.nextSignature
    }, null, '\t');
  }
}

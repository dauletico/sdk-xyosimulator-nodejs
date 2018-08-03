/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 9th August 2018 9:23:08 am
 * @Email: developer@xyfindables.com
 * @Filename: bit-stream-decoder.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 13th August 2018 10:30:23 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { default as binary, ChainableBinary } from 'binary';
import { BridgePayload } from '../data/bridge-payload';

const byteToFunctionLookup: {[n: number]: string} = {
  1: `word8bu`
};

export class BitStreamDecoder {

  /**
   * A helper function to looks up the correct method to call on the binary library based on the header. It then
   * maps that value to a variable inside the `vars` variable
   *
   * @param chainable
   * @param size
   * @param keyVar
   */

  private static extractValueFromBuffer(chainable: ChainableBinary, size: number, keyVar: string) {
    // @ts-ignore-line
    chainable[(byteToFunctionLookup[size] as string)](keyVar);
  }

  constructor(private readonly buffer: Buffer) {}

  public decode(): BridgePayload {
    const extractValueFromBuffer = BitStreamDecoder.extractValueFromBuffer;
    const chainable = binary.parse(this.buffer);

    const values = chainable
      .word32bu('signingTypeHeader')
      .tap(function (vars) {
        extractValueFromBuffer(this, vars.signingTypeHeader, 'signingType');
      })
      .word32bu('dataToBridgeHeader')
      .tap(function (vars) {
        this.buffer('dataToBridge', vars.dataToBridgeHeader);
      })
      .word32bu('currentPublicKeyHeader')
      .tap(function (vars) {
        this.buffer('currentPublicKey', vars.currentPublicKeyHeader);
      })
      .word32bu('nextPublicKeyHeader')
      .tap(function (vars) {
        this.buffer('nextPublicKey', vars.nextPublicKeyHeader);
      })
      .word32bu('currentSignatureHeader')
      .tap(function (vars) {
        this.buffer('currentSignature', vars.currentSignatureHeader);
      })
      .word32bu('nextSignatureHeader')
      .tap(function (vars) {
        this.buffer('nextSignature', vars.nextSignatureHeader);
      })
      .vars;

    return new BridgePayload(
      values.signingType as number,
      values.dataToBridge as Buffer,
      values.currentPublicKey as Buffer,
      values.nextPublicKey  as Buffer,
      values.currentSignature  as Buffer,
      values.nextSignature as Buffer
    );
  }
}

export default BitStreamDecoder;

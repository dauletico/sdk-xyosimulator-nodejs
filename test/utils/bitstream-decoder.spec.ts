/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 9th August 2018 9:23:40 am
 * @Email: developer@xyfindables.com
 * @Filename: bitstream-decoder.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 14th August 2018 2:23:46 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import fs from 'fs';
import { BitStreamDecoder } from '../../src/utils/bit-stream-decoder';
import path from 'path';

describe(`BitStreamDecoder`, () => {
  let testBuffer: Buffer;

  beforeAll(() => {
    const filePath = path.resolve(__dirname, '../../resources/data.BIN');
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, buffer) => {
        if (err) {
          return reject(err);
        }

        testBuffer = buffer;
        resolve(testBuffer);
      });
    });

  });

  it('Should decode a buffer into a BridgePayload', () => {
    const decoder = new BitStreamDecoder(testBuffer);
    const payload = decoder.decode();

    expect(payload.signingType).toBe(0);
    expect(payload.data.length).toBe(200);

    expect(payload.currentPublicKey.length).toBe(94);
    expect(payload.nextPublicKey.length).toBe(94);

    expect(payload.currentSignature.length).toBe(64);
    expect(payload.nextSignature.length).toBe(64);
  });
});

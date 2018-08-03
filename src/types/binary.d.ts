/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 9th August 2018 9:29:29 am
 * @Email: developer@xyfindables.com
 * @Filename: binary.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 13th August 2018 10:30:23 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

declare module 'binary' {
  export function parse(buffer: Buffer): ChainableBinary

  export interface ChainableBinary {
    word32bu(val: string): ChainableBinary;
    word8bu(val: string): ChainableBinary;
    tap(fn: (this: ChainableBinary, vars: { [s: string]: number; }) => void): ChainableBinary;
    buffer(key: string, size: number): ChainableBinary;
    vars: { [s: string]: number | Buffer; };
  }
} 
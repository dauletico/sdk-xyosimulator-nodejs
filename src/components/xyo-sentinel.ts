/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date: Thursday, 9th August 2018 4:39:03 pm
 * @Email: developer@xyfindables.com
 * @Filename: xyo-sentinel.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 13th August 2018 10:30:23 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYONode } from './xyo-node';
import { XYOComponentType } from './xyo-component-type.enum';

export class XYOSentinel extends XYONode {

  public getType(): XYOComponentType {
    return XYOComponentType.XYOSentinel;
  }
}

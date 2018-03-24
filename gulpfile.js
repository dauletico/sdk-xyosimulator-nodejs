/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Wednesday, January 24, 2018 8:44 AM
 * @Email:  developer@xyfindables.com
 * @Filename: gulpfile.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 23, 2018 11:10 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/* eslint no-useless-escape:0 */

const gulp = require(`gulp`);

require(`./gulp/clean`);
require(`./gulp/javascript`);
require(`./gulp/solidity`);
require(`./gulp/test`);

gulp.task(`default`, [`js`, `solidity`]);

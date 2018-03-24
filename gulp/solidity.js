/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, March 16, 2018 8:46 AM
 * @Email:  developer@xyfindables.com
 * @Filename: solidity.js
 * @Last modified by:   arietrouw
 * @Last modified time: Tuesday, March 20, 2018 7:39 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/* eslint no-console: 0 */

const gulp = require(`gulp`);

const connect = require(`gulp-connect`);
// const debug = require(`gulp-debug-streams`);

let watch = null;

const solidity = () =>
  gulp.src([
    `./node_modules/xyo-solidity/dist/**/*.json`,
  ], {
    base: `./node_modules/xyo-solidity/dist/`,
  })
    .pipe(gulp.dest(`./dist/`));
gulp.task(`solidity`, solidity);

gulp.task(`watch-solidity`, [`solidity`], () => {
  watch = watch || gulp.watch(`./node_modules/xyo-solidity/dist/**/*.json`, [`solidity`], connect.reload());
});

module.exports = solidity;

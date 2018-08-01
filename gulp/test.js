/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Thursday, March 22, 2018 9:09 PM
 * @Email:  developer@xyfindables.com
 * @Filename: test.js
 * @Last modified by:   arietrouw
 * @Last modified time: Friday, March 23, 2018 11:14 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

const gulp = require(`gulp`);
const connect = require(`gulp-connect`);

const testDataClasses = require(`../test/dataclasses.js`);

let watch = null;

const test = () => {
  testDataClasses.All((_testDataClassesError) => {
    if (_testDataClassesError) {
      console.error(`testDataClasses FAILED`);
    } else {
      console.log(`testDataClasses PASSED`);
    }
  });
};


gulp.task(`test`, test);

gulp.task(`watch-test`, gulp.series(`test`), () => {
  watch = watch || gulp.watch(`./src/test/**/*.*`, [`test`], connect.reload());
});

module.exports = test;

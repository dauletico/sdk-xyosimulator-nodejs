/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Wednesday, March 14, 2018 8:44 AM
 * @Email:  developer@xyfindables.com
 * @Filename: browserify.js
 * @Last modified by:   arietrouw
 * @Last modified time: Wednesday, March 21, 2018 7:21 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

const gulp = require(`gulp`);

const browserify = require(`browserify`);
const buffer = require(`vinyl-buffer`);
const connect = require(`gulp-connect`);
const foreach = require(`gulp-foreach`);
const source = require(`vinyl-source-stream`);
const sourcemaps = require(`gulp-sourcemaps`);
// const uglify = require(`gulp-uglify`);

let watch = null;

const bundle = (_stream, _file) => {
  const b = browserify({
    insertGlobals: true,
    entries: [`./src/js/${_file.relative}`],
    debug: true,
  });

  return b.bundle()
    .pipe(source(_file.relative))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    // .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`./dist/js`));
};

const javascript = () => {
  gulp.src(`src/js/**/*.js`)
    .pipe(gulp.dest(`./dist/js`));
  gulp.src(`src/js/xyo-client-browser.js`)
    .pipe(foreach(bundle));
};


gulp.task(`js`, javascript);

gulp.task(`watch-js`, gulp.series(`js`), () => {
  watch = watch || gulp.watch(`./src/js/**/*.js`, [`js`], connect.reload());
});

module.exports = javascript;

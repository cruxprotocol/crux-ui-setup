const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const csso = require("gulp-csso");
const babel = require("gulp-babel");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const { series, parallel } = require("gulp");

function css(cb) {
  gulp
    .src("scss/**/*.scss")
    .pipe(sass())
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("css/"));
  cb();
}

exports.default = parallel(css);

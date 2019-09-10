const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const csso = require("gulp-csso");
const babel = require("gulp-babel");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const { series, parallel, watch } = require("gulp");

function css(cb) {
  gulp
    .src("src/scss/**/*.scss")
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
    .pipe(gulp.dest("build/css/"));
  cb();
}

function js(cb) {
  gulp.task("js", function() {
    return gulp
      .src("src/js/**/*.js")
      .pipe(concat("main.js"))
      .pipe(
        babel({
          presets: ["@babel/env"],
          plugins: ["angularjs-annotate"]
        })
      )
      .pipe(uglify())
      .pipe(
        rename({
          extname: ".min.js"
        })
      )
      .pipe(gulp.dest("build/js/"));
  });
  cb();
}
function watchFiles() {
  gulp.watch("src/scss/**/*.scss", css);
  gulp.watch("src/js/**/*.js", js);
}
exports.default = parallel(css, js);
exports.watch = parallel(watchFiles);
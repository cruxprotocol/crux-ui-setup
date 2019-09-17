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

function html(cb) {
	gulp
		.src("src/index.html")
		.pipe(gulp.dest("build/"));
	cb();
}

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
	gulp
		.src("src/js/**/*.js")
		.pipe(
			babel({
				presets: ["@babel/env"]
			})
		)
		.pipe(uglify())
		.pipe(
			rename({
				extname: ".min.js"
			})
		)
		.pipe(gulp.dest("build/js/"));
	cb();
}

function images(cb) {
	gulp
		.src("images/**/*.*")
		.pipe(gulp.dest("build/images"));
	cb();
}

function watchFiles() {
	gulp.watch("src/scss/**/*.scss", css);
	gulp.watch("src/js/**/*.js", js);
	gulp.watch("src/index.html", html);
	gulp.watch("images/**/*.*", images);
}
exports.default = series(html, parallel(css, js), images);
exports.watch = parallel(watchFiles);

const gulp = require("gulp");
const babel = require("gulp-babel");
const iife = require("gulp-iife");
const rename = require("gulp-rename");

const nodeBabelPreset = {
  plugins: ["@babel/plugin-proposal-object-rest-spread"]
};

const browserBabelPreset = {
  plugins: ["@babel/plugin-proposal-object-rest-spread"],
  presets: [
    [
      "@babel/env",
      {
        targets: {
          browsers: ["last 2 versions", "ie >= 11"]
        }
      }
    ],
    "minify"
  ]
};

gulp.task("buildNode", () =>
  gulp
    .src("src/regrest.js")
    .pipe(babel(nodeBabelPreset))
    .pipe(gulp.dest("build"))
);

gulp.task("buildBrowser", () =>
  gulp
    .src("src/regrest.js")
    .pipe(babel(browserBabelPreset))
    .pipe(iife({ useStrict: false }))
    .pipe(rename("regrest.min.js"))
    .pipe(gulp.dest("build"))
);

gulp.task("build", gulp.series(gulp.parallel("buildNode", "buildBrowser")));

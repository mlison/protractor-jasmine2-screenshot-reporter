'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul');

gulp.task('lint', function () {
  return gulp.src(['**/*.js','!node_modules/**','!coverage/**'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('pre-test', function () {
  return gulp.src(['**/*.js','!node_modules/**','!coverage/**','!test/**'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
  return gulp.src('test/*.js')
    .pipe(mocha())
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global: {
          statements: 50,
          branches: 50,
          lines: 50,
          functions: 50
        }
      }
    }));
});

gulp.task('pre-commit', ['lint', 'test']); //test before pre commit

gulp.task('default', ['lint', 'test'], function () {
  console.info('All packed up and ready to go!');
});

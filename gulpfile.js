'use strict';
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

gulp.task('test', function () {
    return gulp.src('*.js')
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', function () {
             gulp.src(['tests/*.js'])
                .pipe(mocha())
                .pipe(istanbul.writeReports());
        });
});

gulp.task('lint', function () {
    return gulp.src(['*.js', 'tests/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('watch', function () {
    gulp.watch('*.js', ['lint']);
});

gulp.task('default', ['lint', 'test']);

'use strict';
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');

gulp.task('test', function () {
    return gulp.src('tests/*.js', {read: false})
        .pipe(mocha());
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

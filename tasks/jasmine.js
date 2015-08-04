var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var webpack = require('webpack-stream');

gulp.task('spec', callback => runSequence('lint', 'jasmine-ci', callback));

var webpackOptions = {
  devtool: 'eval',
  output: {
    filename: 'spec.js'
  },
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
    ]
  }
};

gulp.task('jasmine-ci', function() {
  return gulp.src('spec/**/*_spec.js')
    .pipe(webpack(Object.assign({}, webpackOptions, {watch: false})))
    .pipe(plugins.jasmineBrowser.specRunner({console: true}))
    .pipe(plugins.jasmineBrowser.headless());
});

gulp.task('jasmine', function() {
  return gulp.src('spec/**/*_spec.js')
    .pipe(webpack(Object.assign({}, webpackOptions, {watch: true})))
    .pipe(plugins.jasmineBrowser.specRunner())
    .pipe(plugins.jasmineBrowser.server());
});
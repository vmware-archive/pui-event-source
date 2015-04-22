var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

gulp.task('spec', callback => runSequence('lint', 'jasmine', callback));

gulp.task('jasmine', function() {
  return gulp.src('spec/**/*_spec.js').pipe(plugins.jasmine({includeStackTrace: true}));
});
// Include gulp
var gulp = require('gulp');

// Include plugins
var uglify = require('gulp-uglify');
var concatJs = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var concatCss = require('gulp-concat-css');
var htmlReplace = require('gulp-html-replace');


// Concat and minify js
gulp.task('scripts', function() {

  gulp.src(['js/knockout-latest.js', 'js/app.js'])
    .pipe(concatJs('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js/'))

}); // End scripts


// Concat, remove unneeded styles, minify CSS
gulp.task('css', function() {

  // Remove unecessary Bootstrap styles (almost all)
  gulp.src('css/*.css')
    .pipe(concatCss('all.min.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('build/css/'))

}); // End css


// Minify html
gulp.task('html', function() {

  // minify-html options
  var opts = {
    spare: true
  };

  gulp.src('*.html')
    .pipe(htmlReplace({
      'css': 'css/all.min.css',
      'js': 'js/all.min.js'
    }))
    .pipe(minifyHtml(opts))
    .pipe(gulp.dest('build/'));
    
}); // End html


gulp.task('default', ['scripts', 'css', 'html']);





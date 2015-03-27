'use strict';

var gulp = require('gulp'),
	concat = require('gulp-concat'),
	header = require('gulp-header');


var pkg = require('./package.json');
var banner = ['/**',
	' * <' + '%= pkg.name %> - <' + '%= pkg.description %>',
	' * @version v<' + '%= pkg.version %>',
	' * @link <' + '%= pkg.homepage %>',
	' * @license <' + '%= pkg.license %>',
	' */',
	''].join('\n');

/**
 * Add the default task.
 */
gulp.task('default', function () {
	return gulp.src('./src/*.js')
			.pipe(header(banner, { pkg : pkg } ))
			.pipe(concat('arc-chart.js'))
			.pipe(gulp.dest('./dist/'));
});


/* global require, console */
var gulp = require('gulp');
var runSequence = require('run-sequence');
var runKarma = require('./gulphelp.js').runKarma;
var dhis2Config = require('./gulphelp.js').checkForDHIS2ConfigFile();
var dhisDirectory = dhis2Config.dhisDeployDirectory;
var buildDirectory = 'build';
var watch = require('gulp-watch');
var browserSync = require('browser-sync');

var files = [
    //Vendor dependency files
    'vendor/jquery/dist/jquery.js',
    'vendor/angular/angular.js',
    'vendor/angular-animate/angular-animate.js',
    'vendor/angular-messages/angular-messages.js',
    'vendor/lodash/dist/lodash.js',
    'vendor/ui-router/release/angular-ui-router.js',
    'vendor/restangular/dist/restangular.js',
    'vendor/notify/notify-service.js',
    'vendor/angular-ui-select/dist/select.js',
    //Source files
    'vendor/ngBootstrapper/ngBootstrapper.js',
    'src/app/app.js',
    'src/**/*.js',
    'src/**/*.html',
    'src/*.js',
    'src/*.html',
];

gulp.task('sass', function () {
    var sass = require('gulp-ruby-sass');

    return gulp.src('src/app/app.sass', { base: './src/' })
        .pipe(sass())
        .pipe(gulp.dest(
            ['temp', 'css'].join('/')
        ));
});

gulp.task('sass-watch', ['sass'], browserSync.reload);

gulp.task('clean', function () {
    var del = require('del');
    return del(buildDirectory);
});

gulp.task('jshint', function () {
    var jshint = require('gulp-jshint');

    return gulp.src([
            'src/**/*.js'
        ]).pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('jscs', function () {
    var jscs = require('gulp-jscs');
    return gulp.src([
        'src/**/*.js'
    ]).pipe(jscs('./.jscsrc'));
});

gulp.task('min', ['sass'], function () {
    var mangleJS = false;

    var useref = require('gulp-useref');
    var gulpif = require('gulp-if');
    var ngAnnotate = require('gulp-ng-annotate');
    var uglify = require('gulp-uglify');
    var minifyCss = require('gulp-minify-css');
    var rev = require('gulp-rev');
    var revReplace = require('gulp-rev-replace');

    var assets = useref.assets();

    return gulp.src('src/**/*.html')
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulpif('**/*.css', minifyCss()))
        .pipe(gulpif('**/app.js', ngAnnotate({
            add: true,
            remove: true,
            single_quotes: true, //jshint ignore:line
            stats: true
        })))
        .pipe(gulpif('**/*.js', uglify({
            mangle: mangleJS
        })))
        .pipe(gulpif('!**/index.html', rev()))
        .pipe(revReplace())
        .pipe(gulp.dest(buildDirectory));
});

gulp.task('i18n', function () {
    return gulp.src('src/i18n/**/*.json', { base: './src/' }).pipe(gulp.dest(
        buildDirectory
    ));
});

gulp.task('manifest', function () {
    return gulp.src('src/**/*.webapp', { base: './src/' }).pipe(gulp.dest(
        buildDirectory
    ));
});

gulp.task('images', function () {
    return gulp.src('src/**/icons/**/*', { base: './src/' }).pipe(gulp.dest(
        buildDirectory
    ));
});

gulp.task('copy-files', function () {
    //TODO: Copy templates
});

gulp.task('copy-fonts', function () {
    return gulp.src(['vendor/font-awesome/fonts/**/*.*'], {base: './vendor/font-awesome/'})
        .pipe(gulp.dest(buildDirectory));
});

gulp.task('build', function (cb) {
    runSequence('clean', 'i18n', 'jshint', 'jscs', 'min', 'images', 'manifest', 'copy-files', 'copy-fonts', cb);
});

gulp.task('build-prod', function () {
    runSequence('build', 'package', function () {
        console.log();
        console.log([__dirname, 'datastore-updater.zip'].join('/'));
    });
});

gulp.task('modify-manifest', function (done) {
    var fs = require('fs');

    fs.readFile('build/manifest.webapp', 'utf8', function (err, data) {
        var manifest;

        if (err) {
            console.log('Failed to load manifest from build directory');
            return;
        }

        manifest = JSON.parse(data);
        if (!(manifest && manifest.activities && manifest.activities.dhis && manifest.activities.dhis.href)) {
            console.log('Incorrect manifest "manifest.activities.dhis.href" is not available');
            return;
        }
        manifest.activities.dhis.href = dhis2Config.dhisBaseUrl || '*';

        fs.writeFile('build/manifest.webapp', JSON.stringify(manifest, undefined, 2), function (err) {
            if (err) {
                return console.log('Failed to save modified manifest');
            }
            done();
        });
    });
});

gulp.task('copy-app', function () {
    gulp.src('build/**/*.*', { base: './build/' }).pipe(gulp.dest(dhisDirectory));
});

gulp.task('copy-to-dev', function () {
    runSequence('clean', 'i18n', 'manifest', 'images', 'jshint', 'jscs', 'min', 'copy-files', 'copy-fonts', 'modify-manifest', 'copy-app');
});

gulp.task('copy-to-dev-watch', ['copy-to-dev'], browserSync.reload);

gulp.task('package', function () {
    var zip = require('gulp-zip');
    return gulp.src('build/**/*', { base: './build/' })
        .pipe(zip('datastore-updater.zip', { compress: false }))
        .pipe(gulp.dest('.'));
});

gulp.task('travis', function () {
    return runSequence('jshint', 'jscs');
});

gulp.task('watch', function () {
    gulp.watch('src/**/*.js', ['copy-to-dev']);
    gulp.watch('src/*.js', ['copy-to-dev']);
    gulp.watch('src/**/*.html', ['copy-to-dev']);
    gulp.watch('src/*.html', ['copy-to-dev']);
    gulp.watch('src/**/*.sass', ['copy-to-dev']);
    gulp.watch('src/**/*.css', ['copy-to-dev']);
    gulp.watch('src/*.css', ['copy-to-dev']);
    gulp.watch('src/app/*.json', ['copy-to-dev']);
    // gulp.watch('src/**/*.js', ['copy-to-dev-watch']);
    // gulp.watch('src/*.js', ['copy-to-dev-watch']);
    // gulp.watch('src/**/*.html', ['copy-to-dev-watch']);
    // gulp.watch('src/*.html', ['copy-to-dev-watch']);
    // gulp.watch('src/**/*.sass', ['copy-to-dev-watch']);
    // gulp.watch('src/**/*.css', ['copy-to-dev-watch']);
    // gulp.watch('src/*.css', ['copy-to-dev-watch']);
    // gulp.watch('src/app/*.json', ['copy-to-dev-watch']);
    // browserSync({
    //     proxy: {
    //         target: "http://localhost:8080/DHIS2_HOME/apps/datastore-updater/"
    //     }
    // });
});
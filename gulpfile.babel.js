'use strict';

import gulp        from 'gulp';
import plugins     from 'gulp-load-plugins';
import source      from 'vinyl-source-stream';
import buffer      from 'vinyl-buffer';
import browserify  from 'browserify';
import watchify    from 'watchify';
import browserSync from 'browser-sync';
import del         from 'del';

const $ = plugins();
const PATHS = {
  dest: 'dist/',
  styles: {
    src: 'src/assets/styles/**/*.scss',
    dest: 'dist/assets/styles/'
  },
  scripts: {
    src: 'src/assets/scripts/**/*.js',
    entry: 'src/assets/scripts/main.js',
    dest: 'dist/assets/scripts/'
  },
  html: {
    src: 'src/*.html',
    dest: 'dist/'
  }
};
const bundler = watchify(browserify({
  entries: PATHS.scripts.entry,
  debug: true
})).transform('babelify');

export function clean() {
  return del(PATHS.dest);
}

export function styles() {
  return gulp.src(PATHS.styles.src)
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(PATHS.styles.dest))
    .pipe(browserSync.stream());
}

export function scripts() {
  const entryFileName = PATHS.scripts.entry.substr(PATHS.scripts.entry.lastIndexOf('/') + 1);

  return bundler.bundle()
    .pipe(source(entryFileName))
    .pipe(buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(PATHS.scripts.dest))
    .pipe(browserSync.stream({ once: true }));
}

export function lintScripts() {
  // @TODO: lint scripts through eslint
}

export function html() {
  return gulp.src(PATHS.html.src)
    .pipe(gulp.dest(PATHS.html.dest))
    .pipe(browserSync.stream());
}

export function images() {
  // @TODO: treat images
}

export function watch() {
  // Watch HTML
  gulp.watch(PATHS.html.src, html);
  // Watch Styles
  gulp.watch(PATHS.styles.src, styles);
  // Watch Scripts
  gulp.watch(PATHS.scripts.src, scripts);
}

export function serve(done) {
  browserSync.init({
    server: 'dist',
    ui: false,
    port: 3002,
    open: false
  });

  done();
}

export const build = gulp.series(clean, gulp.parallel(html, styles, scripts));

export const run = gulp.series(build, serve, watch);

export default run;

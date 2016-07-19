'use strict';

import gulp        from 'gulp';
import plugins     from 'gulp-load-plugins';
import source      from 'vinyl-source-stream';
import buffer      from 'vinyl-buffer';
import browserify  from 'browserify';
import watchify    from 'watchify';
import browserSync from 'browser-sync';
import del         from 'del';
import yargs       from 'yargs';
import pkg         from './package.json';

const $ = plugins();
const PRODUCTION = !!(yargs.argv.production);
const ZIP_NAME = `${pkg.name}_${pkg.version}.zip`;

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
  },
  images: {
    src: 'src/assets/img/**/*',
    dest: 'dist/assets/img/'
  }
};

const bundler = watchify(browserify({
  entries: [PATHS.scripts.entry],
  debug: true
})).transform('babelify');
bundler.on('update', bundleScripts);
bundler.on('log', $.util.log);

export function clean() {
  return del([PATHS.dest, '*.zip']);
}

export function styles() {
  return gulp.src(PATHS.styles.src)
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: ['./node_modules/normalize.css'],
      outputStyle: PRODUCTION ? 'compressed' : 'nested'
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(PATHS.styles.dest))
    .pipe(browserSync.stream());
}

// @FIX: browserify stuff makes shit happen, so this task never exits...
export function bundleScripts() {
  const entryFileName = PATHS.scripts.entry.substr(PATHS.scripts.entry.lastIndexOf('/') + 1);

  return bundler.bundle()
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(source(entryFileName))
    .pipe(buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.if(PRODUCTION, $.uglify()))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(PATHS.scripts.dest))
    .pipe(browserSync.stream({ once: true }));
}

export function lintScripts() {
  return gulp.src(PATHS.scripts.src)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
}

export function images() {
  return gulp.src(PATHS.images.src)
    .pipe($.imagemin())
    .pipe(gulp.dest(PATHS.images.dest))
    .pipe(browserSync.stream());
}

export function html() {
  return gulp.src(PATHS.html.src)
    .pipe(gulp.dest(PATHS.html.dest))
    .pipe(browserSync.stream());
}

export function watch() {
  gulp.watch(PATHS.html.src, html);
  gulp.watch(PATHS.images.src, images);
  gulp.watch(PATHS.styles.src, styles);
  gulp.watch(PATHS.scripts.src, gulp.series(lintScripts, bundleScripts));
}

export function copy() {
  return gulp.src('src/favicon-*.png')
    .pipe(gulp.dest(PATHS.dest));
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

export const build = gulp.series(clean, gulp.parallel(copy, html, images, styles, lintScripts, bundleScripts));

export const zip = gulp.series(build, () => {
  return gulp.src(`${PATHS.dest}**/*`)
    .pipe($.zip(ZIP_NAME))
    .pipe(gulp.dest(__dirname));
});

export const run = gulp.series(build, serve, watch);
export default run;

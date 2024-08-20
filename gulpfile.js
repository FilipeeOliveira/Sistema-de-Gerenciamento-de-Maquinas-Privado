const { src, dest, watch, parallel } = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const nunjucks = require('gulp-nunjucks');
const color = require('gulp-color');
const nodePath = require('path');

const outputDir = 'dist';

function _compileToHTML(path, onEnd, log = true, ret = false) {
    if (log) _log('[HTML] Compiling: ' + path, 'GREEN');

    let compileToHTML = src(path, { base: 'src/pages' })
        .pipe(plumber())
        .pipe(nunjucks.compile({
            version: '2.3.0',
            site_name: 'Geral - Conservação e Limpeza'
        }, {
            trimBlocks: true,
            lstripBlocks: true,
            filters: {
                is_active: (str, reg, page) => {
                    reg = new RegExp(reg, 'gm');
                    reg = reg.exec(page);
                    if (reg != null) {
                        return str;
                    }
                }
            }
        }))
        .on('error', console.error.bind(console))
        .on('end', () => {
            if (onEnd) onEnd.call(this);
            if (log) _log('[HTML] Finished', 'GREEN');
        })
        .pipe(dest(outputDir))
        .pipe(plumber.stop());

    if (ret) return compileToHTML;
}

function _compileToSCSS(path, onEnd, log = true, ret = false) {
    if (log) _log('[SCSS] Compiling:' + path, 'GREEN');

    let compileToSCSS = src(path)
        .pipe(plumber())
        .pipe(sass({
            errorLogToConsole: true
        }))
        .on('error', console.error.bind(console))
        .on('end', () => {
            if (onEnd) onEnd.call(this);
            if (log) _log('[SCSS] Finished', 'GREEN');
        })
        .pipe(rename({
            dirname: '',
            extname: '.css'
        }))
        .pipe(postcss([autoprefixer()]))
        .pipe(dest(`${outputDir}/assets/css`))
        .pipe(plumber.stop());

    if (ret) return compileToSCSS;
}

function _log(str, clr) {
    if (!clr) clr = 'WHITE';
    console.log(color(str, clr));
}

function folder() {
    return src('*.*', { read: false })
        .pipe(dest(`${outputDir}/assets`))
        .pipe(dest(`${outputDir}/assets/css`))
        .pipe(dest(`${outputDir}/assets/js`))
        .pipe(dest(`${outputDir}/assets/img`));
}

function image() {
    return src('assets/img/**/*.*')
        .pipe(plumber())
        .pipe(imagemin([
            imageminMozjpeg({ quality: 80 })
        ]))
        .pipe(dest(`${outputDir}/assets/img`))
        .pipe(plumber.stop());
}

function compileToSCSS() {
    return _compileToSCSS('src/scss/**/*.scss', null, false, true);
}

function compileToHTML() {
    return _compileToHTML('src/pages/**/*.html', null, false, true);
}

function watching() {
    compileToSCSS();
    compileToHTML();

    browserSync.init({
        proxy: 'http://localhost:3000',
        port: 4000,
        startPath: '/'
    });

    watch([
        'src/pages/**/*.html',
        'src/scss/**/*.scss',
        'assets/js/**/*.js',
        'assets/img/**/*.*',
    ]).on('change', (file) => {
        file = file.replace(/\\/g, nodePath.sep);

        if (file.indexOf('.scss') > -1) {
            _compileToSCSS('src/scss/**/*.scss', () => {
                return browserSync.reload();
            });
        }

        if (file.indexOf('layouts') > -1 && file.indexOf('.html') > -1) {
            _compileToHTML('src/pages/**/*.html', () => {
                return browserSync.reload();
            });
        } else if (file.indexOf('.html') > -1) {
            _compileToHTML(file, () => {
                return browserSync.reload();
            });
        }

        if (file.indexOf('assets/js') > -1 || file.indexOf('assets/img') > -1) {
            return browserSync.reload();
        }
    });
}

exports.folder = folder;
exports.image = image;
exports.scss = compileToSCSS;
exports.html = compileToHTML;
exports.dist = parallel(folder, compileToSCSS, compileToHTML, image);
exports.default = watching;

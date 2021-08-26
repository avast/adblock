const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const gulp = require('gulp');
const map = require('map-stream');
const gettextParser = require('gettext-parser');

let poObj = {
    srcPath: './locales/adblock/',
    diffPath: './locales/diff/',
    sourcePath: '../src/_locales/',
    workspace: '.',
    setWorkspace: function(path, locale) {
        poObj.workspace = path;
        poObj.srcPath = path + '/locales/' + locale + '/';
        poObj.diffPath = path + '/locales/diff/';
        poObj.sourcePath = path + '/../src/_locales/';
    },
    merge: function () {
        return gulp.src([poObj.workspace + '/locales/to_merge/*.po'])
            .pipe(map(function (file, done) {
                let locale = path.win32.basename(file.path);
                let fileName = poObj.srcPath + locale;

                let po1 = {
                    charset: 'UTF-8',
                    headers: {},
                    translations: {}
                };
                if (fs.existsSync(fileName)) {
                    po1 = fs.readFileSync(fileName);
                    po1 = gettextParser.po.parse(po1);
                }

                let po2 = gettextParser.po.parse(file.contents);
                let po = {
                    charset: po1.charset,
                    headers: {...po1.headers, ...po2.headers},
                    translations: {...po1.translations, ...po2.translations}
                };

                let out = gettextParser.po.compile(po);

                let newFile = file.clone();
                newFile.path = fileName;
                if (newFile.isBuffer()) {
                    newFile.contents = Buffer.from(out);
                } else if (newFile.isStream()) {
                    newFile.contents.write(out);
                    newFile.contents.end();
                }

                done(null, newFile)
            }))
            .pipe(gulp.dest(poObj.srcPath))
    },
    build: function(dest, done, diff) {
        if (!diff) diff = ['en'];
        if (!dest) dest = poObj.workspace + '/locales/test/';
        return gulp.src([poObj.srcPath + '*.po'])
            .pipe(map(function(file, done) {
                let locale = path.win32.basename(file.path, path.extname(file.path));
                let po = gettextParser.po.parse(file.contents);
                if (fs.existsSync(poObj.diffPath + locale + '.po')) {
                    let po_diff = gettextParser.po.parse(fs.readFileSync(poObj.diffPath + locale + '.po'));
                    po.translations = {...po.translations, ...po_diff.translations};
                };

                if (diff.includes(locale)) poObj.diff(locale);

                let out = Object.keys(po.translations).reduce(function(out, key) {
                    if (key == '') return out;
                    let obj = po.translations[key];
                    let msgid = Object.keys(obj)[0];
                    let msgstr = obj[msgid]['msgstr'][0];
                    if (msgstr == '') return out;

                    return {...out, [key]: { 'message': msgstr }};
                }, {});

                out = JSON.stringify(out, 'null', '\t');

                mkdirp.sync(dest + locale);

                let newFile = file.clone();
                newFile.path = dest + locale + '/messages.json';
                if (newFile.isBuffer()) {
                    newFile.contents = Buffer.from(out);
                } else if (newFile.isStream()) {
                    newFile.contents.write(out);
                    newFile.contents.end();
                }

                done(null, newFile)
            }))
            .pipe(gulp.dest(dest));
    },
    diff: function(locale) {
        if (!locale) locale = 'en';
        return gulp.src([poObj.srcPath + locale + '.po'])
            .pipe(map(function(file, done) {
                let po = gettextParser.po.parse(file.contents);
                let po_diff = {
                    charset: 'UTF-8',
                    headers: {},
                    translations: {}
                };
                if (fs.existsSync(poObj.diffPath + locale + '.po')) {
                    po_diff = gettextParser.po.parse(fs.readFileSync(poObj.diffPath + locale + '.po'));
                    po.translations = {...po.translations, ...po_diff.translations};
                }

                let chk_obj = JSON.parse(fs.readFileSync(poObj.sourcePath + locale + '/messages.json'));
                let obj = po.translations;

                let diff = Object.keys(chk_obj).reduce(function(diff, key) {
                    if (obj[key] && obj[key][Object.keys(obj[key])[0]]['msgstr'][0] !== '') {
                        return diff;
                    }
                    return {...diff, [key]: chk_obj[key]};
                }, {});

                if (Object.keys(diff).length) {
                    po_diff.headers = {};
                    po_diff.translations = Object.keys(diff).reduce(function(po_diff, key) {
                        po_diff[key] = {};
                        po_diff[key][diff[key].message] = {
                            'msgctxt': key,
                            'msgid': diff[key].message,
                            'msgstr': diff[key].message,
                        };

                        return po_diff;
                    }, {});

                    let out = gettextParser.po.compile(po_diff);
                    fs.writeFileSync(poObj.diffPath + locale + '_diff.po', out);
                    throw new Error(locale + '.po file is not complete [' + poObj.diffPath + locale + '_diff.po]');
                }
                done();
            }))
    }
};

module.exports = poObj;
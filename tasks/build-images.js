var config          = require('../project.json');
var colors          = require('colors');
var glob            = require('glob');
var fs              = require('fs-extra');
var path            = require('path');
var async           = require('async');
var Imagemin        = require('imagemin');

var id              = 'Images'.blue.bold;
var files           = [];
var index           = 0;
var start;
var paths           = {
    dest: path.join(config.dest, config.assets.images.dest),
    src: path.join(config.src, config.assets.images.src)
};

// task called directly
if (require.main === module) {
    run();
}

/**
 * Logs a given error.
 *
 * @param {Object} error Error object.
 */
function fail(error) {
    return console.error(`${'Error:'.red.bold.underline}\t${error.message} (${error.fileName})`);
}

/**
 * When this task is done, this function will be executed.
 *
 * @param {Function} cb Additional callback to run after being done.
 */
function done(cb) {

    // end not yet reached
    if (++index < files.length) {
        return;
    }

    // get total task time
    var duration = Date.now() - start;

    console.log(`${id}\tFinished. ${'('.bold.blue}${duration}ms${')'.bold.blue}`);

    // run callback function after finishing this task
    if (typeof cb === 'function') {
        cb();
    }
};

/**
 * Returns the Imagemin plugin depending on the given input type.
 *
 * @param {String} type [description]
 * @return {Function|Boolean}
 */
function getPlugin(type) {

    if (type === 'jpg' || type === 'jpeg') {
        return Imagemin.jpegtran({
            progressive: true
        });
    }

    if (type === 'png') {
        return Imagemin.optipng({
            optimizationLevel: 3
        });
    }

    if (type === 'gif') {
        return Imagemin.gifsicle({
            interlaced: true
        });
    }

    if (type === 'svg') {
        return Imagemin.svgo();
    }

    return false;
}

/**
 * The rendering function which processes the image file.
 *
 * @param {String} inputFile The input file.
 * @param {String} outputFile The output file.
 * @param {Object} options Rendering options.
 */
function render(inputFile, outputFile, options) {

    // normalize call without parameters
    options = options || {};

    // get plugin to use for image optimization
    var plugin = getPlugin(path.extname(inputFile).substr(1));

    // are we going to compress?
    var doCompress = config.env === 'prod' && plugin;

    async.series([

        // make sure destination path is writable
        async.apply(fs.ensureDir, path.dirname(outputFile)),

        // compress it in production mode, otherwise just copy it
        function(cb) {

            // only compress in production mode and plugin available
            if (doCompress) {
                return new Imagemin()
                    .src(inputFile)
                    .dest(path.dirname(outputFile))
                    .use(plugin)
                    .run(cb);
            }

            // in develop mode just copy it
            fs.copy(inputFile, outputFile, cb);
        },

        // get file sizes of input and output file
        async.apply(fs.stat, inputFile),
        async.apply(fs.stat, outputFile)

    ], function(error, result) {
        if (error) {
            fail(error);
        } else {

            // get percentage of saved space
            var saved = Math.round((result[2].size / result[3].size - 1) * 10000) / 100;

            if (doCompress) {
                console.log(`${id}\tOptimized ${inputFile} ${'→'.bold.blue} ${outputFile} ${'('.bold.blue}${saved}%${')'.bold.blue}`);
            } else {
                console.log(`${id}\tCopied ${inputFile} ${'→'.bold.blue} ${outputFile}`);
            }
        }

        // task is officially done
        done('done' in options ? options.done : null);
    });
}

/**
 * Function providing logic to run this task.
 *
 * @param {Object} options Running options.
 */
function run(options) {

    // measure task running time
    start = Date.now();

    console.log(`${id}\tStarting task...`);

    // normalize call without parameters
    options = options || {};

    // files given, ignore files from config
    if ('files' in options) {
        files = options.files;
    } else {
        config.assets.images.files.forEach(function(file) {
            files = files.concat(glob.sync(path.join(paths.src, file)));
        });
    }

    // no files to process
    if (files.length < 1) {
        return done('done' in options ? options.done : null);
    }

    // run the main logic for each file
    files.forEach(function(file) {
        var parsedPath = path.parse(file);
        var outputPath = path.join(paths.dest, parsedPath.dir.replace(paths.src, ''));
        var outputFile = path.format({
            dir: outputPath,
            base: parsedPath.base
        });

        render(file, outputFile, {
            done: 'done' in options ? options.done : null
        });
    });
}

module.exports = {
    run: run
};

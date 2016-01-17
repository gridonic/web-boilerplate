var config          = require('../project.json');
var colors          = require('colors');
var glob            = require('glob');
var fs              = require('fs-extra');
var path            = require('path');
var async           = require('async');
var sass            = require('node-sass');
var autoprefixer    = require('autoprefixer');
var postcss         = require('postcss');

var id              = 'Styles'.blue.bold;
var files           = [];
var index           = 0;
var start;
var prefixer        = postcss([ autoprefixer(config.autoprefixer || {}) ]); // https://github.com/ai/browserslist
var outputStyle     = config.env === 'prod' ? 'compressed' : 'nested';
var paths           = {
    dest: path.join(config.dest, config.assets.styles.dest),
    src: path.join(config.src, config.assets.styles.src)
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
    return console.error(`${'Error'.red.bold.underline}\t${error.message}`);
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
 * The rendering function which processes the Sass file.
 *
 * @param {String} inputFile The input file.
 * @param {String} outputFile The output file.
 * @param {Object} options Rendering options.
 */
function render(inputFile, outputFile, options) {
    var start = Date.now();

    // normalize call without parameters
    options = options || {};

    async.series([

        // make sure destination path is writable
        async.apply(fs.ensureDir, path.dirname(outputFile)),

        // render, prefix and save compiled sass file
        (done) => {
            async.waterfall([

                // render it
                async.apply(sass.render, {
                    file: inputFile,
                    outputStyle: outputStyle,
                    outFile: outputFile
                }),

                // prefix it
                (result, cb) => {
                    prefixer.process(result.css).then((result) => {
                        cb(null, result);
                    });
                },

                // write code to file
                (result, cb) => {
                    fs.writeFile(outputFile, result.css, cb);
                }

            ], (error, result) => {
                done(error);
            });
        }

    ], (error, result) => {
        if (error) {
            fail(error);
        } else {
            var duration = Date.now() - start;

            console.log(`${id}\tRendered ${inputFile} ${'→'.bold.blue} ${outputFile} ${'('.bold.blue}${duration}ms${')'.bold.blue}`);
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
        config.assets.styles.files.forEach((file) => {
            files = files.concat(glob.sync(path.join(paths.src, file)));
        });
    }

    // no files to process
    if (files.length < 1) {
        return done('done' in options ? options.done : null);
    }

    // run the main logic for each file
    files.forEach((file) => {
        var parsedPath = path.parse(file);
        var outputPath = path.join(paths.dest, parsedPath.dir.replace(paths.src, ''));
        var outputFile = path.format({
            dir: outputPath,
            base: parsedPath.name + '.css'
        });

        render(file, outputFile, {
            done: 'done' in options ? options.done : null
        });
    });
}

module.exports = {
    run: run
};

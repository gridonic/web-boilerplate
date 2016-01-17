var config          = require('../project.json');
var colors          = require('colors');
var glob            = require('glob');
var fs              = require('fs-extra');
var path            = require('path');
var async           = require('async');
var babel           = require('babel-core');
var uglifyjs        = require('uglify-js');
var browserify      = require('browserify');

var id              = 'Scripts'.blue.bold;
var files           = [];
var index           = 0;
var start;
var paths           = {
    dest: path.join(config.dest, config.assets.scripts.dest),
    src: path.join(config.src, config.assets.scripts.src)
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
    return console.error(`${'Error:'.red.bold.underline}\t${error.message}`);
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
 * The rendering function which processes the JavaScript file.
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
        function(done) {

            async.waterfall([

                // browserify this file and use babel as a transpiler
                function(cb) {
                    browserify(inputFile).transform('babelify', {
                        presets: ['es2015']
                    }).bundle(cb);
                },

                // uglify it in production mode
                function(result, cb) {
                    var code = result.toString();

                    if (config.env === 'prod') {
                        code = uglifyjs.minify(code, {
                            fromString: true
                        }).code.toString();
                    }

                    cb(null, code);
                },

                // write code to file
                function(result, cb) {
                    fs.writeFile(outputFile, result, cb);
                }

            ], function(error, result) {
                done(error);
            });
        }

    ], function(error, result) {
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
        config.assets.scripts.files.forEach(function(file) {
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
            base: parsedPath.name + '.js'
        });

        render(file, outputFile, {
            done: 'done' in options ? options.done : null
        });
    });
}

module.exports = {
    run: run
};

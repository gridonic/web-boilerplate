var config          = require('../project.json');
var colors          = require('colors');
var glob            = require('glob');
var fs              = require('fs-extra');
var path            = require('path');

var id              = 'HTML\t'.blue.bold;
var files           = [];
var index           = 0;
var paths           = {
    dest: path.join(config.dest, config.assets.html.dest),
    src: path.join(config.src, config.assets.html.src)
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
function error(error) {
    return console.error('Error:'.red.underline, error.message);
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

    console.log(id, 'Finished.');

    // run callback function after finishing this task
    if (typeof cb === 'function') {
        cb();
    }
};

/**
 * Function providing logic to run this task.
 *
 * @param {Object} options Running options.
 */
function run(options) {

    // normalize call without parameters
    options = options || {};

    // files given, ignore files from config
    if ('files' in options) {
        files = options.files;
    } else {
        config.assets.html.files.forEach(function(file) {
            files = files.concat(glob.sync(path.join(paths.src, file)));
        });
    }

    console.log(id, 'Starting task...');

    // no files to process
    if (files.length < 1) {
        return 'done' in options ? done(options.done) : done();
    }

    // run the main logic for each file
    files.forEach(function(file) {
        var parsedPath = path.parse(file);
        var outputPath = path.join(paths.dest, parsedPath.dir.replace(paths.src, ''));
        var outputFile = path.format({
            dir: outputPath,
            base: parsedPath.name + '.html'
        });

        // make sure destination path is writable
        fs.ensureDirSync(outputPath);

        fs.copy(file, outputFile, function(error) {
            if (error) {
                return error(error);
            }

            console.log(id, 'Copied', file, '→'.bold.blue, outputFile);

            return 'done' in options ? done(options.done) : done();
        });
    });
}

module.exports = {
    run: run
};

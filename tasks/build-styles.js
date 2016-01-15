var config          = require('../project.json');
var colors          = require('colors');
var glob            = require('glob');
var fs              = require('fs-extra');
var path            = require('path');
var sass            = require('node-sass');
var autoprefixer    = require('autoprefixer');
var postcss         = require('postcss');

var id              = 'Styles\t'.blue.bold;
var files           = [];
var index           = 0;
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
 * The rendering function which processes the Sass file.
 *
 * @param {String} inputFile The input file.
 * @param {String} outputFile The output file.
 * @param {Object} options Rendering options.
 */
function render(inputFile, outputFile, options) {

    // normalize call without parameters
    options = options || {};

    // make sure destination path is writable
    fs.ensureDirSync(path.dirname(outputFile));

    sass.render({
        file: inputFile,
        outputStyle: outputStyle,
        outFile: outputFile
    }, function(error, result) {
        if (error) {
            return fail(error);
        }

        // keep duration for later logging
        var duration = result.stats.duration;

        // prefix it
        prefixer.process(result.css.toString()).then(function(result) {
            result.warnings().forEach(function(warn) {
                console.warn(warn.toString());
            });

            fs.writeFile(outputFile, result.css, function(error) {
                if (error) {
                    return fail(error);
                }

                console.log(id, 'Rendered', inputFile, '→'.bold.blue, outputFile, '('.blue + duration + 'ms' + ')'.blue);

                if ('done' in options) {
                    done(options.done);
                }
            });

        });

    });
}

/**
 * Function providing logic to run this task.
 *
 * @param {Object} options Running options.
 */
function run(options) {

    console.log(id, 'Starting task...');
    
    // normalize call without parameters
    options = options || {};

    // files given, ignore files from config
    if ('files' in options) {
        files = options.files;
    } else {
        config.assets.styles.files.forEach(function(file) {
            files = files.concat(glob.sync(path.join(paths.src, file)));
        });
    }

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

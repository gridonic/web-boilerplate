var config          = require('../project.json');
var colors          = require('colors');
var glob            = require('glob');
var fs              = require('fs-extra');
var path            = require('path');
var sass            = require('node-sass');
var autoprefixer    = require('autoprefixer');
var postcss         = require('postcss');

var id              = 'Styles\t'.blue.bold;
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
            return console.error('Error:'.red.underline, error.message);
        }

        // keep duration for later logging
        var duration = result.stats.duration;

        // prefix it
        prefixer.process(result.css.toString()).then(function (result) {
            result.warnings().forEach(function (warn) {
                console.warn(warn.toString());
            });

            fs.writeFile(outputFile, result.css, function(error) {
                if (error) {
                    return console.error('Error:'.red.underline, error.message);
                }

                console.log(id, 'Rendered', inputFile, '→'.bold.blue, outputFile, '('.blue + duration + 'ms' + ')'.blue);

                if (options.hasOwnProperty('done') === false || typeof options.done !== 'function') {
                    return;
                }

                // run done callback
                options.done();
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
    var i = 0;
    var done = function(result) {

        // reached end not yet
        if (++i < files.length) {
            return;
        }

        console.log(id, 'Finished.');

        // run callback function after finishing this task
        if (options.hasOwnProperty('done') && typeof options.done === 'function') {
            options.done();
        }
    };

    // normalize call without parameters
    options = options || {};

    // no files given, get them from config
    if (options.hasOwnProperty('files') === false) {
        var files = [];

        config.assets.styles.files.forEach(function (file) {
            files = files.concat(glob.sync(path.join(paths.src, file)));
        });
    }

    console.log(id, 'Starting task...');

    // run the main logic for each file
    files.forEach(function (file) {
        var parsedPath = path.parse(file);
        var outputPath = path.join(paths.dest, parsedPath.dir.replace(paths.src, ''));
        var outputFile = path.format({
            dir: outputPath,
            base: parsedPath.name + '.css'
        });

        render(file, outputFile, {
            done: done
        });
    });
}

module.exports = {
    run: run
};

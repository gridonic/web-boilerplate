var config          = require('../project.json');
var colors          = require('colors');
var glob            = require('glob');
var fs              = require('fs-extra');
var path            = require('path');
var babel           = require('babel-core');
var uglifyjs        = require('uglify-js');
var browserify      = require('browserify');

var id              = 'Scripts\t'.blue.bold;
var files           = [];
var index           = 0;
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

    // make sure destination path is writable
    fs.ensureDirSync(path.dirname(outputFile));

    // browserify this file and use babel as a transpiler
    browserify(inputFile)
        .transform('babelify', {
            presets: ['es2015']
        })
        .bundle(function(error, buffer) {
            var code = buffer.toString();

            // uglify it in production mode
            if (config.env === 'prod') {
                code = uglifyjs.minify(buffer.toString(), {
                    fromString: true
                }).code.toString();
            }

            // write code to file
            fs.writeFile(outputFile, code, function(error) {
                if (error) {
                    return error(error);
                }

                console.log(id, 'Rendered', inputFile, '→'.bold.blue, outputFile, '('.blue + (Date.now() - start) + 'ms' + ')'.blue);

                if ('done' in options) {
                    done(options.done);
                }
            });

        }).on('error', error);
}

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
        config.assets.scripts.files.forEach(function(file) {
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
            base: parsedPath.name + '.js'
        });

        return render(file, outputFile, {
            done: 'done' in options ? options.done : null
        });
    });
}

module.exports = {
    run: run
};

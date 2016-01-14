var config          = require('../project.json');
var colors          = require('colors');
var glob            = require('glob');
var fs              = require('fs-extra');
var path            = require('path');
var babel           = require('babel-core');
var uglifyjs        = require('uglify-js');
var browserify      = require('browserify');

var id              = 'Scripts\t'.blue.bold;
var paths           = {
    dest: path.join(config.dest, config.assets.scripts.dest),
    src: path.join(config.src, config.assets.scripts.src)
};

// task called directly
if (require.main === module) {
    run();
}

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

            // uglify it
            var result = uglifyjs.minify(buffer.toString(), {
                fromString: true
            });

            // write code to file
            fs.writeFile(outputFile, result.code, function(error) {
                if (error) {
                    return console.error('Error:'.red.underline, error.message);
                }

                console.log(id, 'Rendered', inputFile, '→'.bold.blue, outputFile, '('.blue + (Date.now() - start) + 'ms' + ')'.blue);

                if (options.hasOwnProperty('done') === false || typeof options.done !== 'function') {
                    return;
                }

                // run done callback
                options.done();
            });

        }).on('error', function (error) {
            return console.error('Error:'.red.underline, error.message);
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

        config.assets.scripts.files.forEach(function (file) {
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
            base: parsedPath.name + '.js'
        });

        var options = {
            done: done
        };

        return render(file, outputFile, options);
    });
}

module.exports = {
    run: run
};

var config          = require('../project.json');
var colors          = require('colors');
var glob            = require('glob');
var fs              = require('fs-extra');
var path            = require('path');

var id              = 'HTML\t'.blue.bold;
var paths           = {
    dest: path.join(config.dest, config.assets.html.dest),
    src: path.join(config.src, config.assets.html.src)
};

// task called directly
if (require.main === module) {
    run();
}

/**
 * Function providing logic to run this task.
 *
 * @param {Object} options Running options.
 */
function run(options) {
    var files = [];
    var i = 0;

    // normalize call without parameters
    options = options || {};

    // no files given, get them from config
    if (options.hasOwnProperty('files') === false) {
        config.assets.html.files.forEach(function(file) {
            files = files.concat(glob.sync(path.join(paths.src, file)));
        });
    } else {
        files = options.files;
    }

    console.log(id, 'Starting task...');

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
                return console.error('Error:'.red.underline, error.message);
            }

            console.log(id, 'Copied', file, '→'.bold.blue, outputFile);

            // reached end not yet
            if (++i < files.length) {
                return;
            }

            console.log(id, 'Finished.');

            // run callback function after finishing this task
            if (options.hasOwnProperty('done') && typeof options.done === 'function') {
                options.done();
            }
        });
    });
}

module.exports = {
    run: run
};

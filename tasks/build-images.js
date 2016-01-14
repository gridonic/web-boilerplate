var config          = require('../project.json');
var colors          = require('colors');
var glob            = require('glob');
var fs              = require('fs-extra');
var path            = require('path');
var Imagemin        = require('imagemin');

var id              = 'Images\t'.blue.bold;
var paths           = {
    dest: path.join(config.dest, config.assets.images.dest),
    src: path.join(config.src, config.assets.images.src)
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

    // only compress in production mode
    if (config.env === 'prod') {
        var plugin;

        switch (path.extname(inputFile)) {
            case '.jpg':
            case '.jpeg':
                plugin = Imagemin.jpegtran({
                    progressive: true
                });

                break;
            case '.png':
                plugin = Imagemin.optipng({
                    optimizationLevel: 3
                });

                break;

            case '.gif':
                plugin = Imagemin.gifsicle({
                    interlaced: true
                });

                break;

            case '.svg':
                plugin = Imagemin.svgo();

                break;
        }

        // we have a plugin that is able to optimize the given image
        if (plugin) {
            return new Imagemin()
                .src(inputFile)
                .dest(path.dirname(outputFile))
                .use(plugin)
                .run(function(error, files) {
                    if (error) {
                        return console.error('Error:'.red.underline, error.message);
                    }

                    var statsInputFile = fs.statSync(inputFile);
                    var statsOutputFile = fs.statSync(outputFile);
                    var saved = Math.round((statsInputFile.size / statsOutputFile.size - 1) * 10000) / 100;

                    console.log(id, 'Optimized', inputFile, '→'.bold.blue, outputFile, '('.blue + saved + '%' + ')'.blue);

                    if (options.hasOwnProperty('done') === false || typeof options.done !== 'function') {
                        return;
                    }

                    // run done callback
                    options.done();
                });
        }
    }

    // in develop mode just copy it
    fs.copy(inputFile, outputFile, function(error) {
        if (error) {
            return console.error('Error:'.red.underline, error.message);
        }

        console.log(id, 'Copied', inputFile, '→'.bold.blue, outputFile);

        if (options.hasOwnProperty('done') === false || typeof options.done !== 'function') {
            return;
        }

        // run done callback
        options.done();
    });
}

/**
 * Function providing logic to run this task.
 *
 * @param {Object} options Running options.
 */
function run(options) {
    var files = [];
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
        config.assets.images.files.forEach(function(file) {
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
            base: parsedPath.base
        });

        render(file, outputFile, {
            done: done
        });
    });
}

module.exports = {
    run: run
};

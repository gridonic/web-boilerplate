var config          = require('../project.json');
var colors          = require('colors');
var glob            = require('glob');
var fs              = require('fs-extra');
var path            = require('path');
var async           = require('async');
var SVGSpriter      = require('svg-sprite');

var id              = 'Sprites'.blue.bold;
var sets            = {};
var index           = 0;
var start;
var paths           = {
    dest: path.join(config.dest, config.assets.sprites.dest),
    src: path.join(config.src, config.assets.sprites.src)
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
    if (++index < Object.keys(sets).length) {
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
* The rendering function which processes the images and creates a sprite out
* of them.
*
* @param {Array} inputFiles The input files.
* @param {String} outputFile The output file.
* @param {Object} options Rendering options.
*/
function render(inputFiles, outputFile, options) {
    var start = Date.now();

    // svg-sprite config options
    // @see https://github.com/jkphl/svg-sprite/blob/master/docs/configuration.md
    var config = {
        mode: {
            inline: true, // prepare for inline embedding
            symbol: true // create a «symbol» sprite
        }
    }

    // normalize call without parameters
    options = options || {};

    // create spriter instance
    var spriter = new SVGSpriter(config);

    async.series([

        // make sure destination path is writable
        async.apply(fs.ensureDir, path.dirname(outputFile)),

        // sprite it
        function(done) {

            // add svg source files
            inputFiles.forEach(function(file) {
                spriter.add(path.resolve(file), path.basename(file), fs.readFileSync(path.resolve(file), {
                    encoding: 'utf-8'
                }));
            });

            // compile sprite
            spriter.compile(function(error, result) {
                if (error) {
                    return done(error);
                }

                var resources = [];
                var parsedPath = path.parse(outputFile);

                // run through all configured output modes
                for (var mode in result) {

                    // run through all created resources and write them to disk
                    for (var type in result[mode]) {
                        var item = {
                            outputFile: path.format({
                                dir: path.dirname(outputFile),
                                base: `${parsedPath.name}.${mode}.${type}${parsedPath.ext}`
                            }),
                            output: result[mode][type].contents.toString()
                        };

                        // just one mode and one type
                        if (Object.keys(result).length === 1 && Object.keys(result[mode]).length === 1) {
                            item.outputFile = outputFile;
                        }

                        resources.push(item);
                    }
                }

                async.parallel(resources.map(function(item) {
                    return async.apply(fs.writeFile, item.outputFile, item.output);
                }), function(error, result) {
                    done(error);
                });
            });
        }

    ], function(error, result) {
        if (error) {
            fail(error);
        } else {
            var duration = Date.now() - start;

            console.log(`${id}\tCreated sprite ${path.parse(outputFile).name.bold.blue} with ${inputFiles.length} images. ${'('.bold.blue}${duration}ms${')'.bold.blue}`);
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
    var files = [];

    // measure task running time
    start = Date.now();

    console.log(`${id}\tStarting task...`);

    // normalize call without parameters
    options = options || {};

    // files given, ignore files from config
    if ('files' in options) {
        files = options.files;
    } else {
        config.assets.sprites.files.forEach(function(file) {
            files = files.concat(glob.sync(path.join(paths.src, file)));
        });
    }

    // scan files and detect sets
    files.forEach(function(file) {
        var setName = path.basename(path.dirname(file));

        // new set
        if (setName in sets === false) {
            sets[setName] = {
                outputFile: path.format({
                    dir: paths.dest,
                    base: setName + '.svg'
                }),
                files: []
            }
        }

        // add file to set
        sets[setName].files.push(file);
    });

    // no sets to process
    if (sets.length < 1) {
        return done('done' in options ? options.done : null);
    }

    // run the main logic for each set
    for (var key in sets) {
        var set = sets[key];

        render(set.files, set.outputFile, {
            done: 'done' in options ? options.done : null
        });
    }

}

module.exports = {
    run: run
};

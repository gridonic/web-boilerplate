var config          = require('../project.json');
var colors          = require('colors');
var glob            = require('glob');
var fs              = require('fs-extra');
var path            = require('path');
var SVGSpriter      = require('svg-sprite');

var id              = 'Sprites\t'.blue.bold;
var sets           = {};
var index           = 0;
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
    return console.error('Error:'.red.underline, error.message);
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

    console.log(id, 'Finished.');

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

    // make sure destination path is writable
    fs.ensureDirSync(path.dirname(outputFile));

    // create spriter instance
    var spriter = new SVGSpriter(config);

    // add svg source files
    inputFiles.forEach(function(file) {
        spriter.add(path.resolve(file), file, fs.readFileSync(path.resolve(file), {
            encoding: 'utf-8'
        }));
    });

    // compile the sprite
    spriter.compile(function(error, result) {
        if (error) {
            return fail(error);
        }

        // run through all configured output modes
        for (var mode in result) {

            // run through all created resources and write them to disk
            for (var type in result[mode]) {
                var code = result[mode][type].contents.toString();

                // write code to file
                fs.writeFile(outputFile, code, function(error) {
                    if (error) {
                        return fail(error);
                    }

                    console.log(id, 'Created sprite', path.parse(outputFile).name.bold.blue, 'with', inputFiles.length, 'images.', '('.blue + (Date.now() - start) + 'ms' + ')'.blue);

                    if ('done' in options) {
                        done(options.done);
                    }
                });
            }
        }
    });
}

/**
* Function providing logic to run this task.
*
* @param {Object} options Running options.
*/
function run(options) {
    var files = [];

    console.log(id, 'Starting task...');

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
        return 'done' in options ? done(options.done) : done();
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

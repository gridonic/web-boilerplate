var config          = require('../project.json');
var colors          = require('colors');
var fs              = require('fs-extra');
var async           = require('async');

var id              = 'Clean'.blue.bold;
var start;

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

    // get total task time
    var duration = Date.now() - start;

    console.log(`${id}\tFinished. ${'('.bold.blue}${duration}ms${')'.bold.blue}`);

    // run callback function after finishing this task
    if (typeof cb === 'function') {
        cb();
    }
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

    async.series([

        // remove destination folder
        async.apply(fs.remove, config.dest)

    ], function(error, result) {
        if (error) {
            fail(error)
        } else {
            console.log(`${id}\tDeleted ${config.dest}`);
        }

        // task is officially done
        done('done' in options ? options.done : null);
    });
}

module.exports = {
    run: run
};

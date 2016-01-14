var config          = require('../project.json');
var colors          = require('colors');
var fs              = require('fs-extra');

var id              = 'Clean\t'.blue.bold;

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
    console.log(id, 'Starting task...');
    console.log(id, 'Deleting', config.dest);

    fs.remove(config.dest, function (error) {
        if (error) {
            return console.error('Error:'.red.underline, error.message);
        }

        console.log(id, 'Finished.');

        // run callback function after finishing this task
        if (options.hasOwnProperty('done') && typeof options.done === 'function') {
            options.done();
        }
    });
}

module.exports = {
    run: run
};

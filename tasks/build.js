var config  = require('../project.json');
var colors  = require('colors');
var styles  = require('../tasks/build-styles');
var scripts = require('../tasks/build-scripts');
var html    = require('../tasks/build-html');
var images  = require('../tasks/build-images');
var sprites = require('../tasks/build-sprites');
var clean   = require('../tasks/clean');

/**
 * Simple task running helper.
 *
 * @param {Array} tasks List of tasks.
 */
function run(tasks) {
    if (Array.isArray(tasks) === false || tasks.length < 1) {
        return;
    }

    // grab first task
    var task = tasks.shift();

    // task has no run method
    if (task.hasOwnProperty('run') === false) {
        return;
    }

    // run task and once it's done, run the next one from queue
    task.run({
        done: function() {
            run(tasks);
        }
    });
}

// log environment
console.log('Running in', (config.env === 'prod' ? 'production' : 'develop').bold.blue, 'mode...\n');

// run in chronological order
run([ clean, styles, scripts, html, images, sprites ]);

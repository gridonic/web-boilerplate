var config  = require('../project.json');
var colors  = require('colors');
var async   = require('async');
var styles  = require('../tasks/build-styles');
var scripts = require('../tasks/build-scripts');
var html    = require('../tasks/build-html');
var images  = require('../tasks/build-images');
var sprites = require('../tasks/build-sprites');
var clean   = require('../tasks/clean');

// measure total build time
var start = Date.now();

// translate requested build environment
var mode = (config.env === 'prod' ? 'production' : 'develop').bold.blue;

// tasks to run in chronological order
var tasks = [ clean, styles, scripts, html, images, sprites ].map(function(task) {
    return function(cb) {
        task.run({
            done: cb
        });
    }
});

// function to run once building finished
var done = function(error, results) {
    var hr = String.fromCharCode(8212).repeat(process.stdout.columns * 0.125).bold.green;
    var duration = Date.now() - start;

    // building done
    console.log(`\n${hr}\nFinished building. ${'('.bold.blue}${duration}ms${')'.bold.blue}`);
};

// log environment
console.log(`Running in ${mode} mode...\n`);

// run tasks
async.series(tasks, done);

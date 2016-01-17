var config  = require('../project.json');
var styles  = require('../tasks/watch-styles');
var scripts = require('../tasks/watch-scripts');
var html    = require('../tasks/watch-html');
var images  = require('../tasks/watch-images');
var sprites = require('../tasks/watch-sprites');
var clean   = require('../tasks/clean');

var colors  = require('colors');

// translate requested build environment
var mode = (config.env === 'prod' ? 'production' : 'develop').bold.blue;

// log environment
console.log(`Watching in ${mode} mode...\n`);

// run all watching tasks
[ styles, scripts, html, images, sprites ].map((task) => {
    task.run();
});

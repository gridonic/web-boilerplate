'use strict';

// pattern to check for task request
let pattern = /--task=(.+)/;

// check if specific task was requested
let task = ((task) => task ? pattern.exec(task)[1] : null)(process.argv.find((arg) => pattern.exec(arg)));

// get project configuration
let config = require('../project.json');

// define default tasks to run, order is being respected
let tasks = {
    styles:     { path: './styles' },
    scripts:    { path: './scripts' },
    fonts:      { path: './copy', id: 'Fonts' },
    html:       { path: './copy', id: 'HTML' },
    images:     { path: './images' },
    sprites:    { path: './sprites' }
};

// specific task requested
if (task in tasks) {
    return new (require(tasks[task].path))(tasks[task]).watch();
}

// needed modules
var chalk = require('chalk');

// translate requested build environment
var mode = chalk.blue.bold(config.env === 'prod' ? 'production' : 'develop');

// log environment
console.log(`Watching in ${mode} mode...\n`);

// run watching tasks
Object.keys(tasks).map((key) => {
    new (require(tasks[key].path))(tasks[key]).watch();
});

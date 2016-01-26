'use strict';

// check if specific task was requested
let task = process.argv[2];

// get project configuration
let config = require('./project.json');

// define default tasks to run, order is being respected
let tasks = {
    styles:     { path: './tasks/styles' },
    scripts:    { path: './tasks/scripts' },
    fonts:      { path: './tasks/copy', id: 'Fonts' },
    html:       { path: './tasks/copy', id: 'HTML' },
    images:     { path: './tasks/images' },
    sprites:    { path: './tasks/sprites' }
};

// specific task requested, pick it and remove other tasks
if (tasks[task]) {
    tasks = Object.defineProperty({}, task, {
        value: tasks[task],
        writable: true,
        enumerable: true,
        configurable: true
    });
}

// needed modules
var chalk = require('chalk');

// translate requested build environment
var mode = chalk.blue.bold(config.env === 'prod' ? 'production' : 'develop');

// log environment
console.log(`\nWatching in ${mode} mode...\n`);

// run watching tasks
Object.keys(tasks).map((key) => {
    new (require(tasks[key].path))(tasks[key]).watch();
});

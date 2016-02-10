'use strict';

// check if specific task was requested
let task = process.argv[2];

// get project configuration
let config = require('./config.js');

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
let chalk = require('chalk');
let async = require('async');

// measure total build time
let start = Date.now();

// translate requested build environment
let mode = chalk.blue.bold(config.env === 'prod' ? 'production' : 'develop');

// function to run once building finished
let done = () => {
    let hr = chalk.green.bold(String.fromCharCode(8212).repeat(process.stdout.columns * 0.125));
    let duration = Date.now() - start;

    // building done
    console.log(`\n${hr}\nFinished building. ${chalk.blue.bold('(')}${duration}ms${chalk.blue.bold(')')}`);
};

// log environment
console.log(`\nBuilding in ${mode} mode...\n`);

// run tasks
async.series(Object.keys(tasks).map((key) => {
    let task = tasks[key];

    // inject configuration
    task.config = config;

    return (cb) => new (require(task.path))(task).run(cb);
}), done);

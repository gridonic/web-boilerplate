'use strict';

// get project configuration
let config = require('./project.json');

// check if specific task was requested
let task = process.argv[2];

// task running function
let run = (tasks, browsersync) => {
    Object.keys(tasks).map(
        (key) => new (require(tasks[key].path))({
            id: tasks[key].id,
            browsersync: browsersync
        }).watch()
    );
}

// needed modules
let chalk = require('chalk');

// translate requested build environment
let mode = chalk.blue.bold(config.env === 'prod' ? 'production' : 'develop');

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

// log environment
console.log(`\nWatching in ${mode} mode...\n`);

// browsersync was requested
if (process.argv.indexOf('--sync') >= 0) {
    let bs = require('browser-sync').create();

    // starts the server
    return bs.init(config.browsersync, () => {

        // give feedback
        console.log(`${chalk.blue.bold('Browsersync')}\tRunning...`);

        // run tasks and provide browsersync instance
        run(tasks, bs);
    });
}

// run tasks without browsersync
run(tasks);

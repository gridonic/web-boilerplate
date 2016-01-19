'use strict';

// pattern to check for task request
let pattern = /--(?:task=|)(.+)/;

// check if specific task was requested
let task = ((task) => task ? pattern.exec(task)[1] : null)(process.argv.find((arg) => pattern.exec(arg)));

// get project configuration
let config = require('../project.json');

// define default tasks to run, order is being respected
let tasks = {
    clean:      { path: './clean' },
    styles:     { path: './styles' },
    scripts:    { path: './scripts' },
    fonts:      { path: './copy', id: 'Fonts' },
    html:       { path: './copy', id: 'HTML' },
    images:     { path: './images' },
    sprites:    { path: './sprites' }
};

// specific task requested
if (task in tasks) {
    return new (require(tasks[task].path))(tasks[task]).run();
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
console.log(`Building in ${mode} mode...\n`);

// run tasks
async.series(Object.keys(tasks).map((key) => {
    return (cb) => new (require(tasks[key].path))(tasks[key]).run(cb);
}), done);

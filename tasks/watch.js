'use strict';

let Task = require('./task');

class Watch extends Task {

    /**
     * Task is being constructed.
     *
     * @param {Object} options Options for this task.
     */
    constructor(options) {

        // make sure options is an object
        options = (typeof options === 'object' && options) || {};

        // set task id
        options.id = 'Watch';

        // call parent constructor
        super(options);
    }

    /**
     * Run this task.
     *
     * @param {Function} done Callback to run when task is done.
     */
    run(done) {

        // check if specific task was requested
        let task = this.settings.indexOf(process.argv[3]);

        // run all tasks or requested one
        let tasks = task < 0 ? this.settings : [ this.settings[task] ];

        // translate requested build environment
        let mode = this.chalk.blue.bold(this.project.env === 'prod' ? 'production' : 'develop');

        // get schedule
        let schedule = new this.schedule(tasks, {
            paths: this.paths,
            project: this.project
        });

        // log environment
        console.log(`\nWatching in ${mode} mode...\n`);

        // run tasks
        schedule.get().map((task) => task.watch());
    }
}

module.exports = Watch;

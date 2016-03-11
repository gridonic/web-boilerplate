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

        // log environment
        console.log(`\nWatching in ${mode} mode...\n`);

        // run tasks
        tasks.forEach((task) => {
            let subtask = task.split(':');
            let options = {
                paths: this.paths,
                project: this.project
            };

            // sub task of a generic task requested
            if (subtask.length > 1) {
                options.id = subtask[1];
                task = subtask[0];
            }

            // path to task file
            let path = this.path.join(this.paths.tasks, task);

            // start task watcher
            new (require(path))(options).watch();
        });
    }
}

module.exports = Watch;

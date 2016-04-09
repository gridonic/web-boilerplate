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
        this.async.parallel(tasks.map((task) => {
            let spawn = task.split(':');
            let options = {
                id: task,
                paths: this.paths,
                project: this.project
            };

            // specific spawn of a generic task requested
            if (spawn.length > 1) {
                task = spawn.shift();
            }

            return (cb) => {

                // prefer custom tasks in local project over global default tasks
                this.async.detectSeries([ this.paths.cwd, this.paths.global ].map(
                    (item) => this.path.join(item, this.paths.tasks, task)
                ), (item, valid) => {
                    try {
                        valid(!!require(item));
                    } catch (e) {
                        valid(false);
                    }
                }, (result) => new (require(result))(options).watch());
            };
        }));
    }
}

module.exports = Watch;

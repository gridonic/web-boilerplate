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
     * After finishing a task, this function will run last.
     *
     * @param {Function} cb Optional callback to run after finishing.
     */
    done(cb) {
        let hr = this.chalk.green.bold(String.fromCharCode(8212).repeat(
            process.stdout.columns * 0.125)
        );

        // get total task time
        let duration = Date.now() - this._start;

        // building done
        console.log(`\n${hr}\nFinished building. ${this.chalk.blue.bold('(')}${duration}ms${this.chalk.blue.bold(')')}`);

        // run callback function after finishing this task
        if (typeof cb === 'function') {
            cb();
        }
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

        // measure task running time
        this._start = Date.now();

        // translate requested build environment
        let mode = this.chalk.blue.bold(this.project.env === 'prod' ? 'production' : 'develop');

        // log environment
        console.log(`\nWatching in ${mode} mode...\n`);

        // run tasks
        tasks.forEach((task) => {
            let subtask = task.split(':');
            let options = {
                project: this.project,
                cwd: this.cwd
            };

            // sub task of a generic task requested
            if (subtask.length > 1) {
                options.id = subtask[1];
                task = subtask[0];
            }

            // path to task file
            let path = this.path.join(this.cwd, 'bin', 'tasks', task);

            // start task watcher
            new (require(path))(options).watch();
        });
    }
}

module.exports = Watch;

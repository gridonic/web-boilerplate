'use strict';

let Task = require('./task');

class Build extends Task {

    /**
     * Task is being constructed.
     *
     * @param {Object} options Options for this task.
     */
    constructor(options) {

        // make sure options is an object
        options = (typeof options === 'object' && options) || {};

        // set task id
        options.id = 'Build';

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
            process.stdout.columns * 0.33)
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
        console.log(`\nBuilding in ${mode} mode...\n`);

        // run tasks
        this.async.series(tasks.map((task) => {
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
                }, (result) => new (require(result))(options).run(cb));
            };
        }), () => this.done(done));
    }
}

module.exports = Build;

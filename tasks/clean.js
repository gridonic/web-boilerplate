'use strict';

let Task = require('./task');

class Clean extends Task {

    /**
     * Task is being constructed.
     *
     * @param {Object} options Options for this task.
     */
    constructor(options) {

        // make sure options is an object
        options = (typeof options === 'object' && options) || {};

        // set task id
        options.id = 'Clean';

        // call parent constructor
        super(options);
    }

    /**
     * Run this task.
     *
     * @param {Function} done Callback to run when task is done.
     */
    run(done) {

        // measure task running time
        this._start = Date.now();

        console.log(`${this.title}Starting task...`);

        this.async.series([

            // remove destination folder
            this.async.apply(this.fs.remove, this.config.dest)

        ], (error, result) => {

            // there was an error during handling the file
            if (error) {
                this.fail(error);

                // calling parent when done
                return super.handler(null, () => this.done(done));
            }

            console.log(`${this.title}Deleted ${this.config.dest}`);

            // calling parent when done
            super.handler(null, () => this.done(done));
        });
    }
}

module.exports = Clean;

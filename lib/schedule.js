'use strict';

class Schedule {

    /**
     * Schedule is being constructed.
     *
     * @param {Object} options Options for this schedule.
     */
    constructor(tasks, options) {

        // make sure options is an object
        options = (typeof options === 'object' && options) || {};

        this.async = require('async');
        this.path = require('path');

        this.tasks = tasks || [];
        this.options = options || {};
    }

    /**
     * Returns a list of tasks which are ready to get executed.
     *
     * @return {Array}
     */
    get() {
        return this.tasks.map((task) => {
            let spawn = task.split(':');
            let paths = [ this.options.paths.cwd, this.options.paths.global ];

            // add id to task options
            this.options.id = task;

            // specific spawn of a generic task requested
            if (spawn.length > 1) {
                task = spawn.shift();
            }

            // prefer custom tasks in local project over global default tasks
            for (var i = 0; i < paths.length; i++) {
                let path = this.path.join(paths[i], this.options.paths.tasks, task);

                try {
                    return new (require(path))(this.options);
                } catch (e) {}
            }
        });
    }
}

module.exports = Schedule;

'use strict';

let Task = require('./task');

class Server extends Task {

    /**
     * Task is being constructed.
     *
     * @param {Object} options Options for this task.
     */
    constructor(options) {

        // make sure options is an object
        options = (typeof options === 'object' && options) || {};

        // set task id
        options.id = 'Server';

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
        console.log(`\nServing in ${mode} mode...\n`);

        // using Browsersync as a server
        let bs = require('browser-sync').create();

        // make sure browersync config property is given
        this.project.browsersync = this.project.browsersync || {};

        // change default behaviour
        this.project.browsersync.logLevel = this.project.browsersync.logLevel || 'silent';
        this.project.browsersync.open = this.project.browsersync.open || false;

        // starts the server
        return bs.init(this.project.browsersync, (error, _bs) => {
            let urls = _bs.options.get('urls');

            // give feedback
            this.print(`Running Browsersync...`);

            if (this.project.browsersync.proxy) {
                this.print(`Proxying ${this.chalk.green.underline(this.project.browsersync.proxy)}`);
            }

            if (this.project.browsersync.server && this.project.browsersync.server.baseDir) {
                this.print(`Serving files from ${this.chalk.green.underline(this.project.browsersync.server.baseDir)}`);
            }

            this.print(`Local: ${this.chalk.green.underline(urls.get('local'))}`);
            this.print(`External: ${this.chalk.green.underline(urls.get('external'))}`);
            this.print(`UI: ${this.chalk.green.underline(urls.get('ui'))}`);
            this.print(`UI External: ${this.chalk.green.underline(urls.get('ui-external'))}`);

            // get schedule
            let schedule = new this.schedule(tasks, {
                paths: this.paths,
                project: this.project,
                browsersync: bs
            });

            // run tasks
            schedule.get().map((task) => task.watch());
        });
    }
}

module.exports = Server;

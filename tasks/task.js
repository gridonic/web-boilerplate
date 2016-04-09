'use strict';

class Task {

    /**
     * Task is being constructed.
     *
     * @param {Object} options Options for this task.
     */
    constructor(options) {

        // make sure options is an object
        options = (typeof options === 'object' && options) || {};

        // public properties
        this.notifier = require('node-notifier');
        this.async = require('async');
        this.chalk = require('chalk');
        this.glob = require('glob');
        this.fs = require('fs-extra');
        this.path = require('path');
        this.settings = {};
        this.browsersync = options.browsersync;
        this.project = options.project || {};
        this.paths = options.paths || {};

        // adopt task specific options
        this.title = this.id = options.id.toLowerCase();

        // task has no specific configuration
        if (this.project[this.id] === undefined) {
            return;
        }

        // save shortcut to task specific settings
        this.settings = this.project[this.id];

        // prepend several options which have paths with source path
        ['files', 'watch', 'ignore'].forEach((set) => {

            // convert string to array
            if (typeof this.settings[set] === 'string') {
                this.settings[set] = [ this.settings[set] ];
            }

            // invalid set
            if (Array.isArray(this.settings[set]) === false) {
                return;
            }

            // prepend source path
            this.settings[set] = this.settings[set].map(
                (item) => this.path.join(this.settings.src || '', item)
            );
        });

        // use files from configuration for processing if given
        if (this.settings.files) {
            this.files = this.settings.files;
        }
    }

    /**
     * Returns the current set task title.
     *
     * @return {String} Task title.
     */
    get title() {
        return this._title;
    }

    /**
     * Sets the current task title that will be used to label logging output.
     *
     * @param {String} title Task title.
     */
    set title(title) {

        // uppercase words and first character
        this._title = title.toLowerCase().replace(
            /(^|[:])+?(\w+?)/g,
            (a, b, c) => b + c.toUpperCase()
        );
    }

    /**
     * Returns the list of files this task is going to handle.
     *
     * @return {Array} List of files.
     */
    get files() {
        return Array.isArray(this._files) ? this._files : [];
    }

    /**
     * Sets the files this task should handle.
     *
     * @param {Array} files List of files.
     */
    set files(files) {
        this._files = this.resolveGlobs(files);
    }

    /**
     * Just a simple printing function to provide consistency among tasks.
     *
     * @param {String} message Message to log.
     * @param {Object} options Options to adjust logging behaviour.
     */
    print(message, options) {

        // make sure options is an object
        options = (typeof options === 'object' && options) || {};

        // maximum title length
        let maxLength = 18;

        // pad title with empty spaces to make sure all titles align
        let space = ' '.repeat(maxLength - this.title.length);

        // depending on type, output is different
        switch (options.type) {
            case 'error':
                console.error(`\n${this.chalk.bgRed.white.bold(' ' + this.title + ' ')}${space}\n${message}\n`);
                break;
            default:
                console.log(`${this.chalk.bgBlue.white.bold(' ' + this.title + ' ')}${space}${message}`);
        }
    }

    /**
     * If a tasks fails, this function will be run.
     *
     * @param {Error} error The thrown error.
     */
    fail(error) {
        let message = error.annotated || error.formatted || error.message;

        this.notifier.notify({
            title: `${this.title} error`,
            message: message
        });

        return this.print(message, {
            type: 'error'
        });
    }

    /**
     * After finishing a task, this function will run last.
     *
     * @param {Function} cb Optional callback to run after finishing.
     */
    done(cb) {

        // get total task time
        let duration = Date.now() - this._start;

        this.print(`Finished. ${this.chalk.blue.bold('(')}${duration}ms${this.chalk.blue.bold(')')}`);

        // run callback function after finishing this task
        if (typeof cb === 'function') {
            cb();
        }
    }

    /**
     * The handler is the actual tasks it's core functionality. This function
     * is called from the process for each file that needs to be handled.
     *
     * @param {Object} file The input file object.
     * @param {Function} done Callback to run when handling is done.
     */
    handler(file, done) {

        // if browsersync is given, fire reload
        if (this.browsersync) {
            this.browsersync.reload(file);
        }

        // handling file is done
        if (typeof done === 'function') {
            done();
        }
    }

    /**
     * The process function will start the actual process of handling all the
     * files by the given handler.
     *
     * @param {Function} handler Function to handle each file.
     * @param {Function} done Callback to run when processing the files is done.
     */
    process(handler, done) {

        // handle all files in parallel
        this.async.parallel(
            this.files.map((file) => (cb) => handler(file, cb)),
            (error, result) => {

                // there was an error during handling the file
                if (error) {
                    this.fail(error);
                }

                done();
            }
        );
    }

    /**
     * Run this task.
     *
     * @param {Function} done Callback to run when task is done.
     */
    run(done) {

        // measure task running time
        this._start = Date.now();

        // print feedback
        this.print('Starting task...');

        // no files to process
        if (Array.isArray(this.files) === false || this.files.length < 1) {
            return this.done(done);
        }

        // start processing files
        this.process(this.handler.bind(this), () => this.done(done));
    }

    /**
     * Start watcher for this task.
     */
    watch() {
        let chokidar = require('chokidar');
        let files = this.settings.watch || this.settings.files;
        let options = {};

        // this instance has no files or watch patterns
        if (files === undefined) {
            return this.fail(new Error('Task has no files or watch patterns.'));
        }

        this.print('Start watching...');

        // check if files should be ignored
        if (this.settings.ignore) {
            options.ignored = this.settings.ignore;
        }

        // initialize watcher
        let watcher = chokidar.watch(files, options);

        watcher
            .on('error', this.fail)
            .on('ready', () => {
                watcher.on('all', (event, path) => {

                    // normalize event
                    if (['add', 'addDir'].indexOf(event) >= 0) {
                        event = 'added';
                    } else if (event === 'change') {
                        event = 'changed';
                    } else if (['unlink', 'unlinkDir'].indexOf(event) >= 0) {
                        event = 'removed';
                    }

                    let time = new Date().toLocaleString();

                    this.print(`File "${path}" has been ${this.chalk.blue.bold(event)}. (${time})`);

                    // run designated event listener
                    this.on(event, path);
                });
            });
    }

    /**
     * Default listener to run once the watcher raised an event.
     *
     * @param {String} event The name of the event.
     * @param {String|Array} files The file(s) that caused the event.
     */
    on(event, files) {

        // by default the removed event will not cause any tasks to run
        if (event === 'removed') {
            return;
        }

        this.files = files;
        this.run();
    }

    /**
     * Match files using the patterns the shell uses, like stars and stuff.
     *
     * @param {Array} files List of files with or without patterns.
     * @return {Array} List of matches files.
     */
    resolveGlobs(files) {
        let result = [];

        // expect files parameter to be an array
        if (Array.isArray(files) === false) {
            files = [ files ];
        }

        // globbing options
        let options = {};

        // check if files should be ignored
        if (this.settings.ignore) {
            options.ignore = this.settings.ignore;
        }

        // check each file (pattern) and add globbing result to stack
        files.forEach((file) => result = result.concat(
            this.glob.sync(file, options)
        ));

        return result;
    }
}

module.exports = Task;

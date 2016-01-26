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
        this.config = require('../project.json');
        this.notifier = require('node-notifier');
        this.async = require('async');
        this.chalk = require('chalk');
        this.glob = require('glob');
        this.fs = require('fs-extra');
        this.path = require('path');
        this.assets = {};
        this.dest = this.config.dest;
        this.src = this.config.src;

        // private properties
        this._files = [];

        // adopt task specific options
        this.id = options.id.toLowerCase();
        this.title = `${this.chalk.blue.bold(options.id)}\t `;

        // task has no assets
        if (this.id in this.config.assets === false) {
            return;
        }

        // shortcut to tasks own assets
        this.assets = this.config.assets[this.id];

        // save task src and destination paths
        this.dest = this.path.join(this.config.dest, this.assets.dest);
        this.src = this.path.join(this.config.src, this.assets.src);

        // by default use files from configuration for processing
        this.files = this.assets.files;
    }

    /**
     * Returns the list of files this task is going to handle.
     *
     * @return {Array} List of files.
     */
    get files() {
        return this._files;
    }

    /**
     * Sets the files this task should handle.
     *
     * @param {Array} files List of files.
     */
    set files(files) {

        // expect files parameter to be an array
        if (Array.isArray(files) === false) {
            files = [ files ];
        }

        // globbing options
        let options = {};

        // reset files stack
        this._files = [];

        // check if files should be ignored
        if ('ignore' in this.assets) {
            options.ignore = this.assets.ignore.map(
                (pattern) => this.path.join(this.src, pattern)
            );
        }

        // check each file (pattern)
        files.forEach((file) => {

            // prepend src path if not already in it
            if (file.indexOf(this.src) !== 0) {
                file = this.path.join(this.src, file);
            }

            // add globbing result to files stack
            this._files = this._files.concat(this.glob.sync(file, options));
        });
    }

    /**
     * If a tasks fails, this function will be run.
     *
     * @param {Error} error The thrown error.
     */
    fail(error) {
        this.notifier.notify({
            title: `${this.chalk.stripColor(this.title)} error`,
            message: error.message
        });

        return console.error(`${this.chalk.white.bgRed.bold(' Error ')}\t ${error.message}`);
    }

    /**
     * After finishing a task, this function will run last.
     *
     * @param {Function} cb Optional callback to run after finishing.
     */
    done(cb) {

        // get total task time
        var duration = Date.now() - this._start;

        console.log(`${this.title}Finished. ${this.chalk.blue.bold('(')}${duration}ms${this.chalk.blue.bold(')')}`);

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
            this.files.map((file) => {
                return (cb) => handler(file, cb)
            }), (error, result) => {

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
        console.log(`${this.title}Starting task...`);

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
        let watch = this.assets['watch' in this.assets ? 'watch' : 'files'];
        let files = watch.map((file) => this.path.join(this.src, file));
        let options = {};

        console.log(`${this.title}Start watching...`);

        // check if files should be ignored
        if ('ignore' in this.assets) {
            options.ignored = this.assets.ignore.map(
                (pattern) => this.path.join(this.src, pattern)
            );
        }

        // initialize watcher
        var watcher = chokidar.watch(files, options);

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

                    console.log(`${this.title}File "${path}" has been ${this.chalk.blue.bold(event)}.`);

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
}

module.exports = Task;

'use strict';

let Task = require('./task');

class Images extends Task {

    /**
     * Task is being constructed.
     *
     * @param {Object} options Options for this task.
     */
    constructor(options) {

        // make sure options is an object
        options = (typeof options === 'object' && options) || {};

        // set task id
        options.id = 'Images';

        // call parent constructor
        super(options);

        // public properties
        this.imagemin = require('imagemin');

        // private properties
        this._plugin = false;
    }

    /**
     * Returns the Imagemin plugin depending on the given input type.
     *
     * @return {Function|Boolean}
     */
    get plugin() {
        return this._plugin;
    }

    /**
     * Sets the Imagemin plugin depending on the given input type.
     *
     * @param {String} type File extension.
     * @return {Function|Boolean}
     */
    set plugin(type) {

        if (type === 'jpg' || type === 'jpeg') {
            return this._plugin = this.imagemin.jpegtran({
                progressive: true
            });
        }

        if (type === 'png') {
            return this._plugin = this.imagemin.optipng({
                optimizationLevel: 3
            });
        }

        if (type === 'gif') {
            return this._plugin = this.imagemin.gifsicle({
                interlaced: true
            });
        }

        if (type === 'svg') {
            return this._plugin = this.imagemin.svgo();
        }

        this._plugin = false;
    }

    /**
     * The actual process of handling the image by optimizing and copying it
     * to the destination.
     *
     * @param {Object} file The input file.
     * @param {Function} done Callback to run when copying is done.
     */
    handler(file, done) {
        let path = this.path.join(this.dest, this.path.dirname(file).replace(this.src, ''));
        let outputFile = this.path.format({
            dir: path,
            base: this.path.basename(file)
        });

        // set plugin to use for image optimization
        this.plugin = this.path.extname(file).substr(1);

        // are we going to compress?
        let doCompress = this.config.env === 'prod' && this.plugin;

        this.async.series([

            // make sure destination path is writable
            this.async.apply(this.fs.ensureDir, path),

            // compress it in production mode, otherwise just copy it
            (cb) => {

                // only compress in production mode and plugin available
                if (doCompress) {
                    return new this.imagemin()
                        .src(file)
                        .dest(path)
                        .use(this.plugin)
                        .run(cb);
                }

                // in develop mode just copy it
                this.fs.copy(file, outputFile, cb);
            },

            // get file sizes of input and output file
            this.async.apply(this.fs.stat, file),
            this.async.apply(this.fs.stat, outputFile)

        ], (error, result) => {

            // there was an error during handling the file
            if (error) {
                this.fail(error);

                // calling parent when done
                return super.handler(file, done);
            }

            // get percentage of saved space
            let saved = Math.round((result[2].size / result[3].size - 1) * 10000) / 100;

            if (doCompress) {
                console.log(`${this.title}Optimized ${file} ${this.chalk.blue.bold('→')} ${outputFile} ${this.chalk.blue.bold('(')}${saved}%${this.chalk.blue.bold(')')}`);
            } else {
                console.log(`${this.title}Copied ${file} ${this.chalk.blue.bold('→')} ${outputFile}`);
            }

            // calling parent when done
            super.handler(file, done);
        });
    }
}

module.exports = Images;

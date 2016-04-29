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
    }

    /**
     * Returns the Imagemin plugin depending on the given input type.
     *
     * @param {String} type File extension.
     * @return {Function|Boolean}
     */
    getImageminPlugin(type) {

        // return plugin depending on file type
        switch (type) {

            case 'jpg':
            case 'jpeg':
                return this.settings.jpg ? this.imagemin.jpegtran(this.settings.jpg) : false;

            case 'png':
                return this.settings.png ? this.imagemin.optipng(this.settings.png) : false;

            case 'gif':
                return this.settings.gif ? this.imagemin.gifsicle(this.settings.gif) : false;

            case 'svg':
                return this.settings.svg ? this.imagemin.svgo(this.settings.svg) : false;

            default:
                return false;
        }
    }

    /**
     * The actual process of handling the image by optimizing and copying it
     * to the destination.
     *
     * @param {Object} file The input file.
     * @param {Function} done Callback to run when handling is done.
     */
    handler(file, done) {
        let path = this.path.join(
            this.settings.dest,
            this.path.dirname(this.path.resolve(file)).replace(this.path.resolve(this.settings.src), '')
        );
        let outputFile = this.path.format({
            dir: path,
            base: this.path.basename(file)
        });

        // get plugin to use for image optimization
        let plugin = this.getImageminPlugin(this.path.extname(file).substr(1));

        // are we going to compress?
        let doCompress = !!(this.project.env === 'prod' && plugin);

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
                        .use(plugin)
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
                this.print(`Optimized ${file} ${this.chalk.blue.bold('→')} ${outputFile} ${this.chalk.blue.bold('(')}${saved}%${this.chalk.blue.bold(')')}`);
            } else {
                this.print(`Copied ${file} ${this.chalk.blue.bold('→')} ${outputFile}`);
            }

            // calling parent when done
            super.handler(outputFile, done);
        });
    }
}

module.exports = Images;

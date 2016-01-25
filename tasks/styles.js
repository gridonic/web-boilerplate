'use strict';

let Task = require('./task');

class Styles extends Task {

    /**
     * Task is being constructed.
     *
     * @param {Object} options Options for this task.
     */
    constructor(options) {

        // make sure options is an object
        options = (typeof options === 'object' && options) || {};

        // set task id
        options.id = 'Styles';

        // call parent constructor
        super(options);
    }

    /**
     * The actual process of handling the Sass files by compiling, prefixing and
     * writing it to the destination.
     *
     * @param {Object} file The input file.
     * @param {Function} done Callback to run when copying is done.
     */
    handler(file, done) {
        let start = Date.now();
        let sass = require('node-sass');
        let autoprefixer = require('autoprefixer');
        let prefixer = require('postcss')([
            autoprefixer(this.config.autoprefixer || {}) // https://github.com/ai/browserslist
        ]);
        let path = this.path.join(this.dest, this.path.dirname(file).replace(this.src, ''));
        let outputFile = this.path.format({
            dir: path,
            base: `${this.path.parse(file).name}.css`
        });

        this.async.series([

            // make sure destination path is writable
            this.async.apply(this.fs.ensureDir, path),

            // process, prefix and save compiled sass file
            (cb) => {
                this.async.waterfall([

                    // compile it
                    this.async.apply(sass.render, {
                        file: file,
                        outputStyle: this.config.env === 'prod' ? 'compressed' : 'nested'
                    }),

                    // prefix it
                    (result, cb) => prefixer
                        .process(result.css)
                        .then((result) => cb(null, result)),

                    // write code to file
                    (result, cb) => this.fs.writeFile(outputFile, result.css, cb)

                ], (error, result) => cb(error));
            }

        ], (error, result) => {

            // there was an error during handling the file
            if (error) {
                this.fail(error);

                // calling parent when done
                return super.handler(file, done);
            }

            let duration = Date.now() - start;

            console.log(`${this.title}Compiled ${file} ${this.chalk.blue.bold('→')} ${outputFile} ${this.chalk.blue.bold('(')}${duration}ms${this.chalk.blue.bold(')')}`);

            // calling parent when done
            super.handler(file, done);
        });
    }

    /**
     * Default listener to run once the watcher raised an event.
     *
     * @param {String} event The name of the event.
     * @param {String|Array} files The file(s) that caused the event.
     */
    on(event, files) {

        // if it's a partial, get all stylesheets that use it
        if (this.path.basename(files)[0] === '_') {
            files = this.assets.files;
        }

        // run parent on method with new data
        super.on(event, files);
    }
}

module.exports = Styles;

'use strict';

let Task = require('./task');

class Scripts extends Task {

    /**
     * Task is being constructed.
     *
     * @param {Object} options Options for this task.
     */
    constructor(options) {

        // make sure options is an object
        options = (typeof options === 'object' && options) || {};

        // set task id
        options.id = 'Scripts';

        // call parent constructor
        super(options);
    }

    /**
     * The actual process of handling the scripts by transpiling, compress and
     * writing it to the destination.
     *
     * @param {Object} file The input file.
     * @param {Function} done Callback to run when copying is done.
     */
    handler(file, done) {
        let start = Date.now();
        let uglifyjs = require('uglify-js');
        let browserify = require('browserify');
        let path = this.path.join(this.dest, this.path.dirname(file).replace(this.src, ''));
        let outputFile = this.path.format({
            dir: path,
            base: `${this.path.parse(file).name}.js`
        });

        this.async.series([

            // make sure destination path is writable
            this.async.apply(this.fs.ensureDir, path),

            // process, prefix and save compiled sass file
            (cb) => {

                this.async.waterfall([

                    // browserify this file and use babel as a transpiler
                    (cb) => browserify(file)
                        .transform('babelify', { presets: ['es2015'] })
                        .bundle(cb),

                    // uglify it in production mode
                    (result, cb) => {
                        let code = result.toString();

                        if (this.config.env === 'prod') {
                            let config = this.assets;

                            // overwrite fromString option
                            config.fromString = true;

                            // minify code
                            code = uglifyjs.minify(code, config).code.toString();
                        }

                        cb(null, code);
                    },

                    // write code to file
                    (result, cb) => this.fs.writeFile(outputFile, result, cb)

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

        // only compile those files which really need to be compiled
        // @todo how do we find out which files are the ones?
        files = this.assets.files;

        // run parent on method with new data
        super.on(event, files);
    }
}

module.exports = Scripts;

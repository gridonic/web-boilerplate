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

        // linting requested
        if (this.assets.eslint) {
            this.eslint = new (require('eslint')).CLIEngine(this.assets.eslint);
        }

        // by default use watch files from configuration for processing
        this.files = this.assets.watch;
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

        // check if linter is available and input is fine
        if (this.eslint && this.lint(file) === false) {
            return super.handler(file, done);
        }

        // only compile those files which really need to be compiled
        if (this.resolveGlobs(this.assets.files).indexOf(file) < 0) {
            return super.handler(file, done);
        }

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
            super.handler(outputFile, done);
        });
    }

    /**
     * Lints a given file.
     *
     * @param {String} file Path to input file.
     * @return {Boolean} Returns false on fail, true on success.
     */
    lint(file) {

        console.log(`${this.title}Linting ${file}`);

        // scan file
        let report = this.eslint.executeOnFiles([ file ]);

        // all fine
        if (report.errorCount < 1) {
            return true;
        }

        // oh oh, linting found errors
        report.results.forEach((result) =>
            result.messages.forEach((message) =>
                this.fail(new Error(`${message.message} (${result.filePath}:${message.line})`))
            )
        );

        return false;
    }
}

module.exports = Scripts;

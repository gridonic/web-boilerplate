'use strict';

let Task = require('./task');

class Copy extends Task {

    /**
     * The actual process of copying the input file to the destination path.
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

        this.async.series([

            // make sure destination path is writable
            this.async.apply(this.fs.ensureDir, path),

            // copy input to output file
            this.async.apply(this.fs.copy, file, outputFile),

        ], (error, result) => {

            // there was an error during handling the file
            if (error) {
                this.fail(error);

                // calling parent when done
                return super.handler(file, done);
            }

            // task has replacement orders
            if (this.assets.replace) {
                let replace = require('replace');

                for (let pattern in this.assets.replace) {
                    let replacement = this.assets.replace[pattern];

                    replace({
                        regex: pattern,
                        replacement: replacement,
                        paths: [ outputFile ],
                        recursive: false,
                        silent: true
                    });
                }
            }

            // give feedback
            console.log(`${this.title}Copied ${file} ${this.chalk.blue.bold('→')} ${outputFile}`);

            // calling parent when done
            super.handler(outputFile, done);
        });
    }

}

module.exports = Copy;

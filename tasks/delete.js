'use strict';

let Task = require('./task');

class Delete extends Task {

    /**
     * The actual process of deleting the input file to the destination path.
     *
     * @param {Object} file The input file.
     * @param {Function} done Callback to run when deleting is done.
     */
    handler(file, done) {
        this.fs.remove(file, (error) => {

            // there was an error during handling the file
            if (error) {
                this.fail(error);

                // calling parent when done
                return super.handler(file, done);
            }

            // give feedback
            this.print(`Deleted ${file}`);

            // calling parent when done
            super.handler(file, done);
        })
    }
}

module.exports = Delete;

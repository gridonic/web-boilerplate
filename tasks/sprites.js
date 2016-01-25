'use strict';

let Task = require('./task');

class Sprites extends Task {

    /**
     * Task is being constructed.
     *
     * @param {Object} options Options for this task.
     */
    constructor() {
        super({
            id: 'Sprites'
        });

        // create spriter instance
        // @see https://github.com/jkphl/svg-sprite/blob/master/docs/configuration.md
        this.spriter = new require('svg-sprite')(this.assets);
    }

    /**
     * Compiles a set of svg files to a svg sprite.
     *
     * @param {Object} set SVG set.
     * @param {Function} done Callback once compiling is done.
     */
    handler(set, done) {
        let start = Date.now();

        this.async.waterfall([

            // make sure destination path is writable
            this.async.apply(
                this.fs.ensureDir,
                this.path.dirname(set.outputFile)
            ),

            // compile sprite
            (garbage, cb) => {

                // add svg source files
                set.files.forEach((file) => {
                    this.spriter.add(
                        this.path.resolve(file),
                        this.path.basename(file),
                        this.fs.readFileSync(this.path.resolve(file), {
                            encoding: 'utf-8'
                        })
                    );
                });


                // compile sprite
                this.spriter.compile((error, result) => {
                    cb(error, result);
                });
            },

            // handle result
            (result, cb) => {
                let resources = [];
                let parsedPath = this.path.parse(set.outputFile);

                // run through all configured output modes
                for (let mode in result) {

                    // run through all created resources and write them to disk
                    for (let type in result[mode]) {
                        let item = {
                            outputFile: this.path.format({
                                dir: this.path.dirname(set.outputFile),
                                base: `${parsedPath.name}.${mode}.${type}${parsedPath.ext}`
                            }),
                            output: result[mode][type].contents.toString()
                        };

                        // just one mode and one type
                        if (Object.keys(result).length === 1 && Object.keys(result[mode]).length === 1) {
                            item.outputFile = set.outputFile;
                        }

                        resources.push(item);
                    }
                }

                // save all modes and types
                this.async.parallel(resources.map((item) => {
                    return this.async.apply(
                        this.fs.writeFile,
                        item.outputFile,
                        item.output
                    );
                }), (error, result) => {
                    cb(error);
                });
            }

        ], (error, result) => {

            // there was an error during handling the file
            if (error) {
                this.fail(error);

                // calling parent when done
                return super.handler(set, done);
            }

            let duration = Date.now() - start;
            let outputName = this.chalk.blue.bold(this.path.parse(set.outputFile).name);

            console.log(`${this.title}Created sprite ${outputName} with ${set.files.length} images. ${this.chalk.blue.bold('(')}${duration}ms${this.chalk.blue.bold(')')}`);

            // calling parent when done
            super.handler(set, done);
        });
    }

    /**
     * The processing function which processes the images and creates a sprite
     * out of them.
     *
     * @param {Function} handler Function to handle each file.
     * @param {Function} done Callback to run when processing the files is done.
     */
    process(handler, done) {
        let sets = {};

        // scan files and detect sets
        this.files.forEach((file) => {
            var setName = this.path.basename(this.path.dirname(file));

            // new set
            if (setName in sets === false) {
                sets[setName] = {
                    outputFile: this.path.format({
                        dir: this.dest,
                        base: `${setName}.svg`
                    }),
                    files: []
                }
            }

            // add file to set
            sets[setName].files.push(file);
        });

        // compile all sprites in parallel
        this.async.parallel(
            Object.keys(sets).map((key) => {
                return (cb) => this.handler(sets[key], cb)
            }), (error, result) => {

                // there was an error during handling the file
                if (error) {
                    this.fail(error);
                }

                return done();
            }
        );
    }

    /**
     * Default listener to run once the watcher raised an event.
     *
     * @param {String} event The name of the event.
     * @param {String|Array} files The file(s) that caused the event.
     */
    on(event, files) {

        // get all available sprites
        this.files = this.assets.files;

        // only keep those which are affected by this event
        let set = this.files.filter(
            (file) => this.path.dirname(file) === this.path.dirname(files)
        );

        // run parent on method with new data
        super.on(event, set);
    }
}

module.exports = Sprites;

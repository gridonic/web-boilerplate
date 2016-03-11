'use strict';

var config;

// check each config property for references to solve
let walk = (input) => {
    for (let key in input) {

        // ignore value as it's useless for us
        if (input.hasOwnProperty(key) === false || input[key] === null) {
            continue;
        }

        // another object, digg deeper
        if (typeof input[key] === 'object') {
            input[key] = walk(input[key]);

            continue;
        }

        // not a string, nor a self-reference found
        if (typeof input[key] !== 'string' || input[key].indexOf('@this.') < 0) {
            continue;
        }

        // get reference key
        let ref = input[key].match(/@this(?:\.[a-z0-9]+)+/i).shift();

        // get the actual value of this reference
        let value = ref.split('.').slice(1).reduce(
            (previous, current) => previous[current],
            config
        );

        input[key] = input[key] === ref ? value : input[key].replace(ref, value);
    }

    return input;
}

// export config
module.exports = (project) => {
    let fs = require('fs');

    // check if project.json is available
    fs.accessSync(project, fs.R_OK | fs.W_OK);

    // save project.json content
    config = require(project) || {};

    // walk config and resolve references
    return walk(config);
};

'use strict';

// get project configuration
let config = require('./project.json');

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

        // replace reference with the value of the actual config entry
        input[key] = input[key].replace(/@this\.([\w\.]+)/, (match, option) =>
            option.split('.').reduce(
                (previous, current) => previous[current],
                config
            )
        );
    }

    return input;
}

// export config
module.exports = walk(config || {});

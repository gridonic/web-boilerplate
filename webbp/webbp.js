#!/usr/bin/env node
'use strict';

// need path module
let path = require('path');

// determine command to run
let command = process.argv[2] || '';

// define important paths
let paths = {};

paths.root = process.cwd();
paths.home = path.join(paths.root, 'webbp');
paths.lib = path.join(paths.home, 'lib');
paths.tasks = path.join(paths.home, 'tasks');

// get project configuration
let config = require(path.join(paths.lib, 'config.js'))(path.join(paths.root, 'project.json'));

// delegate logic
switch (command) {

    // should build project
    case 'build':
        new (require(path.join(paths.tasks, 'build.js')))({
            paths: paths,
            project: config
        }).run();
        break;

    // shall create new project
    case 'new':
        console.log('creating');
        break;

    // shall watch project for changes
    case 'watch':
        new (require(path.join(paths.tasks, 'watch.js')))({
            paths: paths,
            project: config
        }).run();
        break;

    // shall run projects intergrated server
    case 'server':
        console.log('serving');
        break;

    // unknown command
    default:
        console.log('Unknown command.');
}

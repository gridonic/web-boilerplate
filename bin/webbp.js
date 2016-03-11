#!/usr/bin/env node
'use strict';

// need path module
let path = require('path');

// determine command to run
let command = process.argv[2] || '';

// get current working dir
let cwd = process.cwd();

// get project configuration
let config = require(path.join(cwd, 'bin', 'config.js'))(cwd);

// delegate logic
switch (command) {

    // should build project
    case 'build':
        new (require(path.join(cwd, 'bin', 'tasks', 'build.js')))({
            cwd: cwd,
            project: config
        }).run();
        break;

    // shall create new project
    case 'new':
        console.log('creating');
        break;

    // shall watch project for changes
    case 'watch':
        new (require(path.join(cwd, 'bin', 'tasks', 'watch.js')))({
            cwd: cwd,
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

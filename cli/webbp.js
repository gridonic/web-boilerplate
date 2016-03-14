#!/usr/bin/env node
'use strict';

// needed modules
let path = require('path');
let async = require('async');

// determine command to run
let command = process.argv[2] || '';

// define important paths
let paths = {
    cwd: process.cwd(),
    lib: 'lib',
    tasks: 'tasks',
    global: path.dirname(__dirname)
};

// always try to get project.json from current working directory
let config = require(path.join(
    paths.global,
    paths.lib,
    'config.js'
))(path.join(paths.cwd, 'project.json'));

// detect environment switch
let env = process.argv.join(' ').match(/(?:-e |--env=)(\w+)/i);

// inject into configuration or use default environment
config.env = Array.isArray(env) ? env.pop() : 'dev';

// delegate logic
switch (command) {

    // should build or watch project
    case 'build':
    case 'watch':

        // not a webbp project
        if (config === false) {
            console.log(`Unable to find project.json, are you sure this is a webbp project?`);
            break;
        }

        // prefer custom tasks in local project over global default tasks
        async.detectSeries([ paths.cwd, paths.global ].map(
            (item) => path.join(item, paths.tasks, command)
        ), (item, valid) => {
            try {
                valid(!!require(item));
            } catch (e) {
                valid(false);
            }
        }, (result) => {
            new (require(result))({
                paths: paths,
                project: config
            }).run();
        });

        break;

    // shall create new project
    case 'new':
        console.log('creating');
        break;

    // shall run projects intergrated server
    case 'server':
        console.log('serving');
        break;

    // show version number of web boilerplate
    case '-v':
    case '--version':
        console.log(`v${(require(path.join(paths.global, 'package.json'))).version}`);

        break;

    // unknown command
    default:
        console.log('Unknown command.');
}

#!/usr/bin/env node
'use strict';

// needed modules
let path = require('path');
let async = require('async');
let fs = require('fs-extra');
let chalk = require('chalk');

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
if (config) {
    config.env = Array.isArray(env) ? env.pop() : 'dev';
}

// delegate logic
switch (command) {

    // should build/watch project or run built-in server
    case 'build':
    case 'watch':
    case 'server':

        // not a webbp project
        if (config === false) {
            console.error(`Unable to find project.json, are you sure this is a webbp project?`);
            break;
        }

        // prefer custom tasks in local project over global default tasks
        async.detectSeries([
            paths.cwd,
            paths.global
        ].map(
            (item) => path.join(item, paths.tasks, command)
        ), (path, passed) => {
            try {
                passed(require.resolve(path) && true);
            } catch (e) {
                passed(false);
            }
        }, (result) => {
            if (result === undefined) {
                return console.error(`There is no global or local task called '${command}'. This is pretty serious! Try to reinstall the web-boilerplate CLI or create a ticket on GitHub. Thanks!`);
            }

            new (require(result))({
                paths: paths,
                project: config
            }).run();
        });

        break;

    // shall create new project
    case 'new':
    case 'create':
        let name = process.argv[3];

        // no project name given
        if (name === undefined) {
            console.error(`Please provide a project name, e.g. webbp new my-epic-app`);
            break;
        }

        // default files to copy when setting up new project
        let files = [
            path.join(paths.global, 'src'),
            path.join(paths.global, '.eslintrc'),
            // path.join(paths.global, '.gitignore'), @see https://github.com/npm/npm/issues/3763
            path.join(paths.global, 'project.json')
        ];

        // copy files
        async.parallel(
            files.map((item) => (done) => {
                let output = path.join(
                    paths.cwd,
                    name,
                    path.relative(paths.global, item)
                );

                fs.copy(item, output, (error) => done(error));
            }), (error, results) => {
                if (error) {
                    return console.error(error);
                }

                console.log(`Project '${name}' has been created.`);
            }
        );

        break;

    // show version number of web boilerplate
    case '-v':
    case '--version':
        console.log(`v${(require(path.join(paths.global, 'package.json'))).version}`);
        break;

    // unknown command or help
    case '-h':
    case '--help':
    default:
        console.log(`
usage: webbp [command] [options]

commands:

  ${chalk.bold('build')} <task>              build a project
  ${chalk.bold('new')}|${chalk.bold('create')} <location>     create a new project based on the web boilerplate
  ${chalk.bold('server')} <task>             start the built-in configured webserver
  ${chalk.bold('watch')} <task>              watch a project for changes and build immediately

global options:

  -e <env>, --env=<env>     build environment
  -v, --version             output version and exit
  -h, --help                show help`);
}

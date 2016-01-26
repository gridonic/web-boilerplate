'use strict';

// get project configuration
let config = require('./project.json');

// create clean instance of delete task
let clean = new (require('./tasks/delete'))({
    id: 'Clean'
});

// project destination folder shall be cleaned
clean.files = config.dest;

// go go go!
clean.run();

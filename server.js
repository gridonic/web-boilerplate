'use strict';

// push sync parameter
process.argv.push('--sync')

// require watch task
require('./watch.js');

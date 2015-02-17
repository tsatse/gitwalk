#!/usr/bin/env node

var gitwalk = require('../src/index.js');
var command = process.argv[2];
var args = process.argv.slice(3).map(function(arg) {if(arg.indexOf(' ') !== -1) {return '"' + arg + '"';}return arg;});

if(command === 'status') {
    args.push('--porcelain');
}
gitwalk(command, args);

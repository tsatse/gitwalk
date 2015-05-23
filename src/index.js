var Git = require('git-wrapper');
var git = new Git();
var fs = require('fs');
var path = require('path');
var clc = require('cli-color');


var ignoreList = [
    'node_modules'
];

function applySerialAsync(collection, asyncMethod, whenOneDone) {
    var index = 0;

    var iterator = function() {
        if(index < collection.length) {
            asyncMethod(collection[index], function(error, result) {
                whenOneDone(collection[index], error, result);
                index += 1;
                iterator();
            });
        }
    };

    iterator();
}

function flatten(array) {
    if(array instanceof Array) {
        return array.reduce(function(a, b) {return a.concat(flatten(b));}, []);
    }
    else {
        return array;
    }
}

function getRepos(searchPath) {
    if(ignoreList.indexOf(path.basename(searchPath)) !== -1) {
        return [];
    }

    searchPath = path.resolve(searchPath);
    var result = fs.readdirSync(searchPath)
        .map(function(filename) {
            var currentEntry = path.join(searchPath, filename);
            var stat = fs.statSync(currentEntry);
            if(stat.isDirectory()) {
                if(fs.existsSync(path.join(currentEntry, '.git'))) {
                    return currentEntry;
                }
                else {
                    return getRepos(currentEntry);
                }
            }
            return null;
        })
        .filter(function(element) {
            return element;
        });
    return flatten(result);
}

function gw(command, args) {
    if(!command) {
        console.log('missing command');
        return;
    }

    var gitRepos = getRepos('.');

    applySerialAsync(
        gitRepos,
        function(repo, callback) {
            process.chdir(repo);
            git.exec(command, args, callback);
        },
        function(repo, error, result) {
            if(error || result) {
                console.log(clc.magenta(repo));
            }
            if(error) {
                console.error(error);
                return;
            }
            if(result) {
                console.log(result);
            }
        });
}

module.exports = gw;

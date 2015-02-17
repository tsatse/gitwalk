var Git = require('git-wrapper');
var git = new Git();
var fs = require('fs');
var path = require('path');
var clc = require('cli-color');

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

function gw(command, args) {
    if(!command) {
        console.log('missing command');
        return;
    }

    var gitRepos = fs.readdirSync('.')
        .map(function(filename) {
            return path.resolve(path.join('./', filename));
        })
        .filter(function(filename) {
            var stat = fs.statSync(filename);
            return stat.isDirectory() && fs.existsSync(path.join(filename, '.git'));
        });

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

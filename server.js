var github = require('octonode');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var linter = require('./linter');
var parse = require('parse-diff');

const args = process.argv.slice(2);
const accessToken = args[0];
const port = args[1] || 3000;

var githubClient = github.client(accessToken);
var github = require('./github')(accessToken);
var url = 'http://ghrr.lukasmartinelli.ch:80/events';
var serverSocket = require('socket.io')(http);
var clientSocket = require('socket.io-client')(url);

app.use(express.static(__dirname + '/public'));
http.listen(port);


clientSocket.on('pushevent', function(event) {
    var parsePatchFile = function(patch) {
        var parts= patch.split(/(diff --git .*)/);
        return {
            header: parts[0],
            body: parse(parts.slice(1).join(''))
        };
    };

    var getPatches = function(callback) {
        event.payload.commits.forEach(function(commit) {
            github.getPatch(event.repo, commit, function(patch) {
                callback(commit, parsePatchFile(patch));
            });
        });
    };

    var checkRepo = function(callback) {
        getPatches(function(commit, patch) {
            var lintResults = linter.check(patch.body);
            callback(commit, lintResults);
        });
    };

    var getErrorCodeFragment = function(commit, error, filename, callback) {
        github.getSpecificFile(event.repo, commit, filename, function(file) {
            var lines = file.split('\n');
            var from = to = error.linenumber;
            if(error.linenumber > 3 && error.linenumber + 3 < lines.length) {
                from = error.linenumber - 3 ;
                to = error.linenumber + 3 ;
                callback(lines.slice(from, to).join('\n'));
            }
        });
    };

    var printLintResult = function(commit, result) {
        if(result.errors.length == 0) {
            console.log(['OK',
                         event.repo.name,
                         commit.sha.slice(0,7),
                         result.filename].join('\t'));
        } else {
            result.errors.forEach(function(error) {
                var errorLocation = result.filename + ':' + error.linenumber;
                var errorType = function() {
                    if(error.new) return 'NEW';
                    if(error.delete) return 'DELETE';
                    return 'NONE';
                };


                console.log([errorType(),
                             event.repo.name,
                             //commit.author.email,
                             commit.sha.slice(0,7),
                             errorLocation].join('\t'));
            });
        }
    };

    var handleErrors = function(commit, result) {
        result.errors.forEach(function(error) {
            getErrorCodeFragment(commit, error, result.filename,
            function(fragment) {
                /*
                console.log('--------' + result.filename + '----------');
                console.log(fragment);
                console.log('-----------------------------------------');
                */
            });
        });
    };

    github.getLanguages(event.repo, function(languages) {
        if('C++' in languages) {
            checkRepo(function(commit, lintResults) {
                lintResults.forEach(function(result) {
                    printLintResult(commit, result);
                    handleErrors(commit, result);
                });
            });
        }
    });
});

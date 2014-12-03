/*eslint new-cap:0 */
'use strict';
var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var linter = require('./linter');
var parse = require('./parse');

var options = (function() {
    var args = process.argv.slice(2);
    return {
        accessToken: args[0],
        port: args[1] || 3000,
        codeMargin: 7,
        url: 'http://ghrr.lukasmartinelli.ch:80/events'
    };
})();

var github = require('./github')(options.accessToken);
var code = require('./code')(options.codeMargin);

var serverSocket = require('socket.io')(http);
var clientSocket = require('socket.io-client')(options.url);

app.use(express.static(path.join(__dirname ,'/public')));
http.listen(options.port);

clientSocket.on('pushevent', function (event) {
    var getPatches = function (callback) {
        event.payload.commits.forEach(function (commit) {
            github.patch(event.repo, commit, function (patch) {
                callback(commit, parse(patch));
            });
        });
    };

    var checkRepo = function (callback) {
        getPatches(function (commit, patch) {
            var lintResults = linter.check(patch.body);
            callback(commit, lintResults);
        });
    };

    var handleErrors = function (commit, result) {
        result.errors.forEach(function (error) {
            github.file(event.repo.name, commit.sha, result.filename, function(file) {
                serverSocket.emit('error', {
                    actor: event.actor,
                    repo: event.repo,
                    commit: commit,
                    error: error,
                    filename: result.filename,
                    code: code.codeFragment(error.linenumber, file)
                });
            });
        });
    };

    var logSkip = function (lintResults, repoName, commitSha) {
        if (lintResults.length === 0) {
            console.log([
                'SKIP',
                event.repo.name,
                commitSha.slice(0, 7)
            ].join('\t'));
        }
    };

    checkRepo(function (commit, lintResults) {
        logSkip(lintResults, event.repo.name, commit.sha);
        lintResults.forEach(function (result) {
            linter.log(event.repo.name, commit.sha, result);
            handleErrors(commit, result);
        });
    });
});

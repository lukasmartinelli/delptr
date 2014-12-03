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
        url: 'http://ghrr.lukasmartinelli.ch:80/events',
        repoLanguagesPath: 'repos_by_language.csv'
    };
})();

var parseRepos = require('./parse-repo-languages')(options.repoLanguagesPath);
var github = require('./github')(options.accessToken);
var code = require('./code')(options.codeMargin);

var serverSocket = require('socket.io')(http);
var clientSocket = require('socket.io-client')(options.url);

var repos = {};
parseRepos(function(results) {
    repos = results;
});

var handlePushEvent = function(event) {
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

    var logSkip = function (repoName, commitSha, info) {
        console.log([
            'SKIP', 
            repoName,
            commitSha.slice(0, 7)
        ].join('\t'));
    };

    if(event.repo.name in repos && repos[event.repo.name] !== 'C++') {
        console.log(['IGNORE', event.repo.name].join('\t')); 
    } else {
        checkRepo(function (commit, lintResults) {
            if (lintResults.length === 0) {
                logSkip(event.repo.name, commit.sha);
            }
            lintResults.forEach(function (result) {
                linter.log(event.repo.name, commit.sha, result);
                handleErrors(commit, result);
            });
        });
    }
};

app.use(express.static(path.join(__dirname ,'/public')));
http.listen(options.port);

clientSocket.on('pushevent', handlePushEvent);

/*eslint new-cap:0 */
'use strict';
//require('v8-profiler');
var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var linter = require('./linter');
var log = require('./log');

var options = (function() {
    var args = process.argv.slice(2);
    return {
        accessToken: process.env.GITHUB_TOKEN,
        port: process.env.VCAP_APP_PORT || 3000,
        codeMargin: 7,
        url: process.env.GHRR_URI || 'http://ghrr.lukasmartinelli.ch:80/events'
    };
})();

if(!options.accessToken) {
    console.error('No Github Access token specified.');
    process.exit(1);
}

var github = require('./github')(options.accessToken);
var code = require('./code')(options.codeMargin);

var serverSocket = require('socket.io')(http);
var clientSocket = require('socket.io-client')(options.url);
var lastError;

var handlePushEvent = function(event) {
    var checkRepo = function (callback) {
        event.payload.commits.forEach(function (commit) {
            github.patch(event.repo, commit, function (patch) {
                callback(commit, linter.check(patch));
            });
        });
    };

    var handleError = function (commit, filename, error) {
        github.file(event.repo.name, commit.sha, filename, function(file) {
            lastError = {
                actor: event.actor,
                repo: event.repo,
                commit: commit,
                error: error,
                filename: filename,
                code: code.fragment(error.linenumber, file)
            };
            serverSocket.emit('linterror', lastError);
        });
    };

    var handleCheck = function(commit, lintResults) {
        if (lintResults.length === 0) {
            log.skip(event.repo.name, commit.sha);
        }

        lintResults.forEach(function (lintResult) {
            if (lintResult.errors.length > 0) {
                lintResult.errors.forEach(function(error) {
                    handleError(commit, lintResult.filename, error);
                    log.lintError(event.repo.name, commit.sha,
                                     lintResult.filename, error);
                });
            } else {
                log.success(event.repo.name, commit.sha, lintResult.filename);
            }
        });

    };

    github.languages(event.repo, function(languages) {
        if('C++' in languages) {
            checkRepo(handleCheck);
        } else {
            log.ignore(event.repo.name);
        }
    }, function() {
        checkRepo(handleCheck);
    });
};

app.use(express.static(path.join(__dirname ,'/public')));
http.listen(options.port);
clientSocket.on('pushevent', handlePushEvent);
serverSocket.on('connection', function(browserSocket) {
    if(lastError) {
        browserSocket.emit('linterror', lastError);
    }
});

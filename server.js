/*eslint new-cap:0 */
'use strict';

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var path = require('path');
var linter = require('./linter');
var log = require('./log');

var options = {
    accessToken: process.env.GITHUB_TOKEN,
    port: process.env.VCAP_APP_PORT || 3000,
    codeMargin: 7,
    url: process.env.GHRR_URI || 'http://ghrr.gq:80/events'
};

if(!options.accessToken) {
    throw 'No Github Access token specified.';
}

var github = require('./github')(options.accessToken);
var code = require('./code')(options.codeMargin);

var ioClient = require('socket.io-client')(options.url);
var lastError;

server.listen(options.port);
app.use(express.static(path.join(__dirname, '/public')));

io.on('connection', function(socket) {
    if(lastError) {
        socket.emit('linterror', lastError);
    }

    function handlePushEvent(event) {
        function checkRepo(callback) {
            event.payload.commits.forEach(function (commit) {
                github.patch(event.repo, commit, function (patch) {
                    callback(commit, linter.checkPatch(patch));
                });
            });
        };

        function handleError(commit, filename, error) {
            github.file(event.repo.name, commit.sha, filename, function(file) {
                lastError = {
                    actor: event.actor,
                    repo: event.repo,
                    commit: commit,
                    error: error,
                    filename: filename,
                    code: code.fragment(error.linenumber, file)
                };
                socket.emit('linterror', lastError);
            });
        };

        function handleCheck(commit, lintResults) {
            if (lintResults.length === 0) {
                log.skip(event.repo.name, commit.sha);
            }

            lintResults.forEach(function processLintResults(lintResult) {
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

        github.languages(event.repo, function handleLanguage(languages) {
            if('C++' in languages) {
                checkRepo(handleCheck);
            } else {
                log.ignore(event.repo.name);
            }
        }, function() {
            checkRepo(handleCheck);
        });
    };

    ioClient.on('pushevent', handlePushEvent);
});


ioClient.on('connect', function() {
    console.log('Connected to ' + options.url);
});

ioClient.on('connect_error', function(err) {
    console.error(err);
});

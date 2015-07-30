'use strict';
var colors = require('colors/safe');

function log(color, message) {
    if (process.stdout.isTTY && process.env.DELPTR_COLOR) {
        console.log(color(message));
    } else {
        console.log(message);
    }
};

function errorType(error) {
    if (error.new) {
        return 'NEW';
    }
    if (error.delete) {
        return 'DELETE';
    }
    return 'NONE';
};

module.exports = {
    success: function success(repoName, commitSha, filename) {
        log(colors.green, [
            'OK',
            repoName,
            commitSha.slice(0, 7),
            filename
        ].join('\t'));
    },
    lintError: function lintError(repoName, commitSha, filename, error) {
        log(colors.red, [
            errorType(error),
            repoName,
            commitSha.slice(0, 7),
            filename + ':' + error.linenumber
        ].join('\t'));
    },
    skip: function skip(repoName, commitSha) {
        console.log([
            'SKIP',
            repoName,
            commitSha.slice(0, 7)
        ].join('\t'));
    },
    ignore: function ignore(repoName) {
        console.log(['IGNORE', repoName].join('\t'));
    }
};

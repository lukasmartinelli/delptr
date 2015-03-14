'use strict';
var colors = require('colors/safe');

var log = function(color, message) {
    if (process.stdout.isTTY && process.env.DELPTR_COLOR) {
        console.log(color(message));
    } else {
        console.log(message);
    }
};

var errorType = function (error) {
    if (error.new) {
        return 'NEW';
    }
    if (error.delete) {
        return 'DELETE';
    }
    return 'NONE';
};

module.exports = {
    success: function(repoName, commitSha, filename) {
        log(colors.green, [
            'OK',
            repoName,
            commitSha.slice(0, 7),
            filename
        ].join('\t'));
    },
    lintError: function(repoName, commitSha, filename, error) {
        log(colors.red, [
            errorType(error),
            repoName,
            commitSha.slice(0, 7),
            filename + ':' + error.linenumber
        ].join('\t'));
    },
    skip: function(repoName, commitSha) {
        console.log([
            'SKIP',
            repoName,
            commitSha.slice(0, 7)
        ].join('\t'));
    },
    ignore: function(repoName) {
        console.log(['IGNORE', repoName].join('\t'));
    }
};

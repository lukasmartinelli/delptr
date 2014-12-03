'use strict';
var parse = require('parse-diff');

module.exports = function (patch) {
    var parts = patch.split(/(diff --git [\w\W]*)/);
    return {
        header: parts[0],
        body: parse(parts.slice(1).join(''))
    };
};

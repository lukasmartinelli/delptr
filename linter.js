'use strict';
var parse = require('parse-diff');

var hasUnmanagedMemory = function (lines) {
    return lines.filter(function (line) {
        return line.type === 'add' || line.type === 'normal';
    }).map(function (line) {
        return {
            linenumber: line.ln || line.ln2,
            content: line.content,
            new: /new .*;/.test(line.content) &&
                 ! /unique_ptr|shared_ptr/.test(line.content),
            delete: /delete .*;/.test(line.content)
        };
    }).filter(function (line) {
        return line.new || line.delete;
    });
};

var isCppFile = function (file) {
    return (/^[\w\W]*\.(cpp|hpp|h)$/i).test(file.to);
};

var checkFile = function (file) {
    return {
        filename: file.to || file.from,
        errors: hasUnmanagedMemory(file.lines)
    };
};

var checkCppFiles = function (files) {
    return files.filter(isCppFile).map(checkFile);
};

module.exports = {
    checkPatch: function(patch) {
        var parts = patch.split(/(diff --git [\w\W]*)/);
        var files = parse(parts.slice(1).join(''));
        return checkCppFiles(files);
    },
    check: checkCppFiles
};

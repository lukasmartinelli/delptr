'use strict';
var hasUnmanagedMemory = function (lines) {
    return lines.filter(function (line) {
        return line.type === 'add' || line.type === 'normal';
    }).map(function (line) {
        return {
            linenumber: line.ln || line.ln2,
            content: line.content,
            new: line.content.indexOf('new ') > -1,
            delete: line.content.indexOf('delete ') > -1
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
    check: function (files) {
        return files .filter(isCppFile).map(checkFile);
    },
    log: function(repoName, commitSha, result) {
        if (result.errors.length === 0) {
            console.log([
                'OK',
                repoName,
                commitSha.slice(0, 7),
                result.filename
            ].join('\t'));
        } else {
            result.errors.forEach(function (error) {
                console.log([
                    errorType(error),
                    repoName,
                    commitSha.slice(0, 7),
                    result.filename + ':' + error.linenumber
                ].join('\t'));
            });
        }
    }
};

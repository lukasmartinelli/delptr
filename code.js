'use strict';
module.exports = function (codeMargin) {
    var maxFragmentRange = function (linenumber, lastLine) {
        var from = linenumber - codeMargin;
        var to = linenumber + codeMargin;

        return {
            from: from < 1 ? 1 : from,
            to: to > lastLine ? lastLine : to
        };
    };
    return {
        fragment: function (lineNumber, file) {
            var lines = file.split('\n');
            var range = maxFragmentRange(lineNumber, lines.length);
            var fragment = lines.slice(range.from - 1, range.to).join('\n');
            return fragment;
        }
    };
};

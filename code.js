'use strict';
module.exports = function (codeMargin) {
    var maxFragmentRange = function (linenumber, lastLine) {
        var from, to;
        from = to = linenumber;
        if (linenumber < codeMargin) {
            from = 0;
        } else if (linenumber + codeMargin > lastLine) {
            to = lastLine;
        } else {
            from = linenumber - codeMargin;
            to = linenumber + codeMargin;
        }
        return {
            from: from,
            to: to
        };
    };
    return {
        codeFragment: function (lineNumber, file) {
            var lines = file.split('\n'), range = maxFragmentRange(lineNumber, lines.length - 1), fragment = lines.slice(range.from, range.to).join('\n');
            return fragment;
        }
    };
};

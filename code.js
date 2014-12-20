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
    var findSurroundingBlock = function (linenumber, lines) {
        var findOpenBracket = function() {
            for(var i = linenumber - 1; i > 0; i--) {
                if(lines[i].indexOf('{') > -1) {
                    if(lines[i].trim() === '{') {
                        return i;
                    } else {
                        return i + 1;
                    }
                }
            }
            return -1;
        };
        var findClosedBracket = function () {
            for(var i = linenumber - 1; i < lines.length; i++) {
                if(lines[i].indexOf('}') > -1) {
                    return i + 1;
                }
            }
            return -1;
        };
        return {
            from: findOpenBracket(),
            to: findClosedBracket()
        };
    };
    return {
        fragment: function (lineNumber, file) {
            var lines = file.split('\n');
            var block = findSurroundingBlock(lineNumber, lines);

            if(block.from > -1 && block.to > -1) {
                return lines.slice(block.from - 1, block.to).join('\n');
            } else {
                var range = maxFragmentRange(lineNumber, lines.length);
                return lines.slice(range.from - 1, range.to).join('\n');
            }
        }
    };
};

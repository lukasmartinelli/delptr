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
        //Always search the correct opening bracket users can see
        //the function name
        var findOpeningBracket = function() {
            var stack = [];
            for(var i = linenumber - 1; i > 0; i--) {
                if(lines[i].indexOf('}') > -1 ) {
                    stack.push(i);
                }
                if(lines[i].indexOf('{') > -1) {
                    if(stack.length === 0) {
                        return lines[i].trim() === '{' ? i : i + 1;
                    } else {
                        stack.pop();
                    }
                }
            }
            return -1;
        };

        // We don't need to find the real closing bracket just the next one
        // this tends to look nicer even though it is not correct
        var findClosedBracket = function () {
            for(var i = linenumber - 1; i < lines.length; i++) {
                if(lines[i].indexOf('}') > -1) {
                    return i + 1;
                }
            }
            return -1;
        };

        return {
            from: findOpeningBracket(),
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

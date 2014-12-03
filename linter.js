var makeHunkReadable = function(hunk) {
    return hunk.split('\n')
        .filter(function(line) {
            return line.charAt(0) != '-';
        })
        .map(function(line) {
            if(line.charAt(0) == '+') {
                return ' ' + line.substr(1);
            }
            return line;
        });
};

var hasUnmanagedMemory = function(lines) {
    return lines
        .filter(function(line) {
            return line.type == 'add' || line.type == 'normal';
        })
        .map(function(line) {
            return {
                linenumber: line.ln || line.ln2,
                content: line.content,
                new: line.content.indexOf("new ") > -1,
                delete: line.content.indexOf("delete ") > -1,
            };
        })
        .filter(function(line) {
            return line.new || line.delete;
        });
};

var isCppFile = function(file) {
    return /^.*\.(cpp|hpp|h)$/i.test(file.to);
};

var checkFile = function(file) {
    return {
        filename: file.to || file.from,
        errors: hasUnmanagedMemory(file.lines)
    };
};

module.exports = {
    check: function(files) {
        return files
            .filter(isCppFile)
            .map(checkFile);
    }
};

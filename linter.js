var str = require('string');

var getCommits = function(event, repo, callback) {
    event.payload.commits.forEach(function(commit) {
        repo.commit(commit.sha, function(err, data, headers) {
            callback(data);
        });
    });
};

var isCppFile = function(file) {
    return str(file.filename).endsWith('.cpp') ||
           str(file.filename).endsWith('.h');
};

var hasUnmanagedMemory = function(patch) {
    if(!patch) return true;
    var lines = patch.split('\n');
    return lines.filter(function(line) {
        return line.indexOf("delete ")> -1 ||
               line.indexOf("new ")> -1;
    });
};

var checkFile = function(file) {

    return {
        filename: file.filename,
        errors: hasUnmanagedMemory(file.patch)
    };
};

module.exports = {
    checkRepo: function(event, repo, callback) {
        getCommits(event, repo, function(commit) {
            callback(commit.files.filter(isCppFile).map(function(file) {
                return checkFile(file);
            }));
        });
    }
};

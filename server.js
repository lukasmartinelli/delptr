var github = require('octonode');
var GithubEventEmitter = require('./event-emitter');

var client = github.client('9451220220bbc26c5ebe7972a3fe2b0988a14b7e');
var githubEvents = new GithubEventEmitter(client);

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

githubEvents.on('event', function(event) {
    var getCppPatches = function(callback) {
        var repo = client.repo(event.repo.name);
        var patches = [];
        var isCppFile = function(filename) {
            return filename.endsWith(".cpp") || filename.endsWith(".h");
        };

        event.payload.commits.forEach(function(commit) {
            repo.commit(commit.sha, function(err, data, headers) {
                for (i = 0; i < data.files.length; i++) {
                    if(isCppFile(data.files[i].filename)) {
                        patches.push(data.files[i].patch);
                    }
                }
                callback(patches);
            });
        });
    }

    var hasCppLanguage = function(callback) {
        var repo = client.repo(event.repo.name);
        repo.languages(function(err, data, headers) {
            callback("C++" in data);
        });
    }

    if(event.type !== 'PushEvent') return;
    hasCppLanguage(function(isCpp) {
        if(!isCpp) return;
        getCppPatches(function(patches) {
            console.log("CHANGES FOR " + event.repo.name);
            console.log("==============================");
            console.log(patches);
        });
    });
});

githubEvents.start();

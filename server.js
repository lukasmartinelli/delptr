var github = require('octonode');
var GithubEventEmitter = require('./event-emitter');
var _  = require('underscore');
_.str = require('underscore.string');

var client = github.client('9451220220bbc26c5ebe7972a3fe2b0988a14b7e');
var githubEvents = new GithubEventEmitter(client);

githubEvents.on('event', function(event) {
    if(event.type !== 'PushEvent') return;

    var repo = client.repo(event.repo.name);
    var getCppPatches = function(callback) {
        event.payload.commits.forEach(function(commit) {
            repo.commit(commit.sha, function(err, data, headers) {
                var cppFiles = _.filter(data.files, function(file) {
                    return _.str.endsWith(file.filename, ".cpp") ||
                           _.str.endsWith(file.filename, ".h");
                });

                cppFiles.forEach(function(file) {
                    callback(file.patch);
                });
            });
        });
    };

    repo.languages(function(err, data, headers) {
        if("C++" in data) {
           getCppPatches(function(patch) {
                console.log(patch);
           });
        }
    });
});

githubEvents.start();

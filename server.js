var github = require('octonode');
var colors = require('colors/safe');
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
                    callback(commit, file.patch);
                });
            });
        });
    };

    var findDeletePointers = function(patch) {
        return _.str.include(patch, "delete ");
    };

    repo.languages(function(err, data, headers) {
        if("C++" in data) {
           getCppPatches(function(commit, patch) {
               if(findDeletePointers(patch)) {
                    console.log(colors.red("delete used in commit " +
                                commit.sha + " by user " + event.actor.login +
                                " in repository " + event.repo.name));
               } else {
                    console.log(colors.gray("No delete used in commit " +
                                commit.sha + " by user " + event.actor.login +
                                " in repository " + event.repo.name));
               }
           });
        } else {
            console.log(colors.gray("Skipping because " + event.repo.name +
                                    " is not a C++ repo"));
        }
    });
});

githubEvents.start();

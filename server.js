var github = require('octonode');
var fs = require("fs");
var readline = require('readline');
var colors = require('colors/safe');
var GithubEventEmitter = require('./event-emitter');
var _  = require('underscore');
_.str = require('underscore.string');

var client = github.client('9451220220bbc26c5ebe7972a3fe2b0988a14b7e');
var githubEvents = new GithubEventEmitter(client);


var rd = readline.createInterface({
    input: fs.createReadStream('./cpp_repos.txt'),
    output: process.stdout,
    terminal: false
});

var cppRepos = {};
rd.on('line', function(line) {
    cppRepos[line] = true;
});

githubEvents.on('event', function(event) {
    if(event.type !== 'PushEvent') return;

    var repo = client.repo(event.repo.name);

    var getCommits = function(callback) {
        event.payload.commits.forEach(function(commit) {
            repo.commit(commit.sha, function(err, data, headers) {
                callback(data);
            });
        });
    };

    var getCppPatches = function(callback) {
        getCommits(function(commit) {
            var cppFiles = _.filter(commit.files, function(file) {
                return _.str.endsWith(file.filename, ".cpp") ||
                       _.str.endsWith(file.filename, ".h");
            });
            var patches = _.map(cppFiles, function(file) {
                return file.patch;
            });
            callback(commit, patches);
        });
    };

    var hasDeletePointers = function(patches) {
        return _.chain(patches)
            .map(function(patch) {
                return _.str.include(patch, "delete ");
            })
            .some(true).value();
    };

    var processRepo = function() {
        getCppPatches(function(commit, patches) {
            if(hasDeletePointers(patches)) {
                line = commit.sha.slice(0, 10) + " in " + event.repo.name +
                       " has uses delete";
                console.log(colors.red(line));
            } else {
                line = commit.sha.slice(0, 10) + " in " + event.repo.name +
                       " has no delete";
                console.log(colors.gray(line));
            }
        });
    };

    if(event.repo.name in cppRepos) {
        processRepo();
    } else {
        repo.languages(function(err, data, headers) {
            if("C++" in data) {
                processRepo();
            }
        });
    }
});

githubEvents.start();

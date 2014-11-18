var github = require('octonode');
var fs = require("fs");
var express = require('express');
var app = express();
var readline = require('readline');
var colors = require('colors/safe');
var GithubEventEmitter = require('./event-emitter');
var _  = require('underscore');
_.str = require('underscore.string');
var http = require('http').Server(app);
var io = require('socket.io')(http);
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

app.use(express.static(__dirname + '/public'));
//app.listen(process.env.PORT || 3000);

io.on('connection', function(socket) {
      console.log('a user connected');
});


http.listen(3000, function(){
    console.log('listening on *:3000');
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
                line = commit.sha.slice(0, 7) + " in " + event.repo.name +
                       " has uses delete";
                io.emit('log', line);
                console.log(colors.red(line));
            } else {
                var author = "";
                if(commit.author) {
                    author = commit.author.login; 
                } else if(commit.commit.commiter) {
                    author = commit.commit.commiter;
                }
                io.emit('log', {
                    'author': author,
                    'commit': commit.sha.slice(0, 7),
                    'commit_url': commit.html_url,
                    'repo': event.repo.name,
                    'repo_url': 'https://github.com/' + event.repo.name, 
                });
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

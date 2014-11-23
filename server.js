var github = require('octonode');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var linter = require('./linter');

const args = process.argv.slice(2);
const accessToken = args[0];
const port = args[1] || 3000;

var githubClient = github.client(accessToken);
var url = 'http://ghrr.lukasmartinelli.ch:80/events';
var serverSocket = require('socket.io')(http);
var clientSocket = require('socket.io-client')(url);

app.use(express.static(__dirname + '/public'));
http.listen(port);

clientSocket.on('pushevent', function(event) {
    var repo = githubClient.repo(event.repo.name);

    var getCommits = function(callback) {
        event.payload.commits.forEach(function(commit) {
            repo.commit(commit.sha, function(err, data, headers) {
                callback(data);
            });
        });
    };

    repo.languages(function(err, data, headers) {
        if('C++' in data) {
            linter.checkRepo(event, repo, function(check) {
                console.log(check);
            }); 
        } 
    });
});

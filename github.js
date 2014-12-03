'use strict';
var request = require('request');

module.exports = function (accessToken) {
    var headers = {
        'User-Agent': 'delptr',
        'Authorization': 'token ' + accessToken
    };

    return {
        languages: function (repo, callback) {
            var options = {
                url: repo.url + '/languages',
                headers: headers
            };

            request(options, function (error, response, body) {
                var results = [],
                    unixTimestamp = response.headers['x-ratelimit-reset'],
                    resetDate = new Date(unixTimestamp * 1000);
                if (error) {
                    console.error(error);
                }
                if (response.statusCode === 403) {
                    console.error('Ratelimit reached! Try again at ', resetDate.toLocaleTimeString());
                }
                if (response.statusCode === 200) {
                    results = JSON.parse(body);
                }
                callback(results);
            });
        },
        patch: function (repo, commit, callback) {
            var url = 'https://github.com/' + repo.name +
                      '/commit/' + commit.sha + '.patch';

            request({ url: url }, function (error, response, body) {
                if (error) {
                    console.error(error);
                } else if (response.statusCode === 404) {
                    console.error('Patch at ' + url + ' not found');
                } else {
                    callback(body);
                }
            });
        },
        file: function (repoName, commitSha, filename, callback) {
            var url = 'https://raw.githubusercontent.com/' + repoName +
                      '/' + commitSha + '/' + filename;

            request({ url: url }, function (error, response, body) {
                if (error) {
                    console.error(error);
                } else if (response.statusCode === 404) {
                    console.error('File at ' + url + ' not found');
                } else {
                    callback(body);
                }
            });
        }
    };
};

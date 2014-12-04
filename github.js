'use strict';
var request = require('request');

module.exports = function (accessToken) {
    var headers = { 'User-Agent': 'delptr' };
    if(accessToken) {
        headers.Authorization = 'token ' + accessToken;
    }

    return {
        languages: function (repo, callback, rateLimitReached) {
            var options = {
                url: repo.url + '/languages',
                headers: headers
            };

            request(options, function (error, response, body) {
                var unixTimestamp = response.headers['x-ratelimit-reset'];
                var resetDate = new Date(unixTimestamp * 1000);

                if (error) {
                    console.error(error);
                } else if (response.statusCode === 403) {
                    rateLimitReached(resetDate);
                } else if (response.statusCode === 200) {
                    callback(JSON.parse(body));
                } else {
                    console.error(body);
                }
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

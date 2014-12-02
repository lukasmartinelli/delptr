var request = require('request');

module.exports = function(accessToken) {
    return {
        getLanguages: function(repo, callback) {
            var options = {
                url: repo.url + '/languages',
                headers: {
                    'User-Agent': 'delptr',
                    'Authorization': 'token ' + accessToken,
                }
            };
            request(options, function(error, response, body) {
                if(error) {
                    console.error(error);
                    callback([]);
                }

                if(response.statusCode == 403) {
                    var unixTimestamp = response.headers['x-ratelimit-reset'];
                    var resetDate = new Date(unixTimestamp * 1000);
                    console.error('Ratelimit reached! Try again at ',
                                   resetDate.toLocaleTimeString());
                    callback([]);
                }

                if(response.statusCode == 200) {
                    callback(JSON.parse(body));
                }
            });
        },
        getPatch: function(repo, commit, callback) {
            var url = 'https://github.com/' + repo.name +
                      '/commit/' + commit.sha + '.patch';

            request({ url: url}, function(error, response, body) {
                callback(body);
            });
        }
    };
};

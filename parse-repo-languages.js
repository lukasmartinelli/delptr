'use strict';
var csv = require('fast-csv');

module.exports = function(path) {
    return function(callback) {
        var repos = {};
        csv.fromPath(path, { headers: true })
            .validate(function(data) {
                return data.language !== '';
             })
            .on('data', function(data){
                repos[data.full_name] = data.language;
            })
            .on('error', function(error) {
                console.error(error);
            })
            .on('end', function(){
                callback(repos);
            });
    };
};

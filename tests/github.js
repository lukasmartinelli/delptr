'use strict';
var should = require('should');
var proxyquire = require('proxyquire');

describe('languages', function() {
    var requestStub = function(options, callback) {
        var response = {
            statusCode: 200,
            headers: {
                'x-ratelimit-reset': 100
            }
        };
        callback(undefined, response, '{}');
    };
    var github = proxyquire('../github', { 'request': requestStub })();

    it('parses json if successful', function() {
        github.languages('lukasmartinelli/delptr', function(body) {
            should(body).eql({});
        });
    });
});

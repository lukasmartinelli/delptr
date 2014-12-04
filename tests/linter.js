'use strict';
var should = require('should');
var linter = require('../linter');

describe('check', function() {
    it('skips non cpp files', function() {
        var files = ['a.rb', 'b.py', 'c.js'].map(function(filename) {
            return { to: filename };
        });
        var results = linter.check(files);
        should(results).eql([]);
    });
    it('checks cpp files', function() {
        var files = ['a.c', 'b.h', 'c.hpp', 'd.cpp'].map(function(filename) {
            return { to: filename, lines: [''] };
        });
        var results = linter.check(files);
        should(results).eql([
                { filename: 'b.h', errors: [] },
                { filename: 'c.hpp', errors: [] },
                { filename: 'd.cpp', errors: [] }
        ]);
    });
});

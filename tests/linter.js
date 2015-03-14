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
    it('ignores comments', function() {
        var files = [{
            to: 'a.cpp',
            lines: [{
                type: 'add',
                content: '// create new object',
                ln: 10
            }]
        }];
        var results = linter.check(files);
        should(results).eql([
            { filename: 'a.cpp', errors: [] }
        ]);
    });
    it('finds deletes', function() {
        var files = [{
            to: 'a.cpp',
            lines: [{
                type: 'add',
                content: 'delete ptr;',
                ln: 10
            }]
        }];
        var results = linter.check(files);
        should(results).eql([{
            filename: 'a.cpp',
            errors: [{
                content: 'delete ptr;',
                delete: true,
                new: false,
                linenumber: 10
            }]}
        ]);
    });
    it('finds new allocations', function() {
        var files = [{
            to: 'a.cpp',
            lines: [{
                type: 'add',
                content: 'Settings settings* = new Settings();',
                ln: 1
            }]
        }];
        var results = linter.check(files);
        should(results).eql([{
            filename: 'a.cpp',
            errors: [{
                content: 'Settings settings* = new Settings();',
                delete: false,
                new: true,
                linenumber: 1
            }]}
        ]);
    });
    it('allows use of unique_ptr', function() {
        var files = [{
            to: 'a.cpp',
            lines: [{
                type: 'add',
                content: 'return std::unique_ptr<X>{new X{i}};',
                ln: 1
            }]
        }];
        var results = linter.check(files);
        should(results).eql([{
            filename: 'a.cpp',
            errors: []
        }]);
    });
});

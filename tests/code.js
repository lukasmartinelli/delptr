'use strict';
var should = require('should');
var code = require('../code')(1);

var sampleFile = '#include <iostream>\n' +
                 'using namespace std;\n' +
                 'int main() {\n' +
                 '    cout << "Hello World!" << endl;\n' +
                 '    return 0;\n' +
                 '}';

describe('fragment', function() {
    it('returns line plus margin below and above', function() {
        var fragment = code.fragment(4, sampleFile);
        should(fragment).equal(
            'int main() {\n' +
            '    cout << "Hello World!" << endl;\n' +
            '    return 0;'
        );
    });
    it('returns line and margin above if line is at end of file', function() {
        var fragment = code.fragment(6, sampleFile);
        should(fragment).equal(
             '    return 0;\n' +
             '}'
        );
    });
    it('returns line and margin below if line is at start of file', function() {
        var fragment = code.fragment(1, sampleFile);
        should(fragment).equal(
            '#include <iostream>\n' +
            'using namespace std;'
        );
    });
});

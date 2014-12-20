'use strict';
var should = require('should');
var code = require('../code')(1);

var sampleFile = '#include <iostream>\n' +
                 'using namespace std;\n' +
                 'int main() {\n' +
                 '    cout << "Hello World!" << endl;\n' +
                 '    return 0;\n' +
                 '}';

var newlineSampleFile = '#include <iostream>\n' +
                 'using namespace std;\n' +
                 'int main()\n' +
                 '{\n' +
                 '    cout << "Hello World!" << endl;\n' +
                 '    return 0;\n' +
                 '}';

describe('fragment', function() {
    it('returns line and margin below if line is at start of file', function() {
        var fragment = code.fragment(1, sampleFile);
        should(fragment).equal(
            '#include <iostream>\n' +
            'using namespace std;'
        );
    });
    it('returns block between opening and closing bracket', function() {
        var fragment = code.fragment(4, sampleFile);
        should(fragment).eql(
             'int main() {\n' +
             '    cout << "Hello World!" << endl;\n' +
             '    return 0;\n' +
             '}'
        );
    });
    it('can deal with newline brackets', function() {
        var fragment = code.fragment(4, newlineSampleFile);
        should(fragment).eql(
             'int main()\n' +
             '{\n' +
             '    cout << "Hello World!" << endl;\n' +
             '    return 0;\n' +
             '}'
        );
    });
});

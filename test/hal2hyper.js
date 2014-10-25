var should = require('should');
var hal2hyper = require('..');
var readdir = require('fs').readdirSync;

describe('hal2hyper', function() {
  var root = __dirname + '/cases';
  readdir(root).forEach(function(name) {
    var path = root + '/' + name + '/';
    var input = require(path + 'in.json');
    var output = require(path + 'out.json');

    it(name, function() {
      hal2hyper(input).should.eql(output);
    });
  });
});

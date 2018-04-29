const assume = require('assume');
const dotfig = require('../');

describe('dotfig', function () {
  it('is exported as a function', function () {
    assume(dotfig).is.a('function');
  });

  it('finds the .examplerc in the parent directory', function () {
    const example = dotfig('example');

    assume(example).is.a('object');
    assume(example.config).equals('value');
  });

  it('returns null if it cannot find anything', function () {
    const example = dotfig('ifyoucreatedthispropertyinyourpackagejsonorfilenameitbreaksthetest');

    assume(example).is.a('null');
  });

  it('prefers .dot files over package.json', function () {
    const example = dotfig('test');

    assume(example).is.a('object');
    assume(example.config).equals('value');
  });

  it('allows the dot file to be disabled', function () {
    const example = dotfig({ filename: false, name: 'test' });

    assume(example).is.a('object');
    assume(example.config).equals('should not read from package.json');
  });

  it('reads package.json if .file is broken', function () {
    const example = dotfig('broken');

    assume(example).is.a('object');
    assume(example.works).equals('well');
  });

  it('allows ignoring of the `package.json`', function () {
    const example = dotfig({ name: 'another', pkgjson: false });

    assume(example).is.a('object');
    assume(example.wat).equals('doin');
  });

  it('allows the name to be specified as name property', function () {
    const example = dotfig({ name: 'broken' });

    assume(example).is.a('object');
    assume(example.works).equals('well');
  })

  it('overrides the filename', function () {
    const example = dotfig({
      name: 'broken',
      filename: '.testrc'
    });

    assume(example).is.a('object');
    assume(example.config).equals('value');
  });

  it('finds nothing when pkgjson and filename are false', function () {
    const example = dotfig({ name: 'test', filename: false, pkgjson: false });

    assume(example).is.a('null');
  });

  describe('#resolve', function () {
    it('exposes the resolve method', function () {
      assume(dotfig.resolve).is.a('function');
    });
  });

  describe('#parse', function () {
    it('exposes the parse method', function () {
      assume(dotfig.parse).is.a('function');
    });
  });

  describe('.parent', function () {
    it('exposes the found parent', function () {
      assume(dotfig.parent).equals(__filename);
    });
  });
});

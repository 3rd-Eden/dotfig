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

  it('reads package.json if .file is broken', function () {
    const example = dotfig('broken');

    assume(example).is.a('object');
    assume(example.works).equals('well');
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
});

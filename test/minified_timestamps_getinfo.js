var assert = require('assert');
var grunt = require('grunt');
var options = require('./fixtures/options');
var assetCollector = require('./../tasks/lib/assetCollector')(grunt, options);

describe('minified_timestamps_getinfo', function () {
    it('should return 1 asset', function () {
        // path relative to the Gruntfile
        var info = assetCollector.getAssetsInfo('test/fixtures/template.html');

        assert.equal(Object.keys(info).length, 1);
    });
});

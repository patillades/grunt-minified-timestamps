/* global require */

var assert = require('assert');
var grunt = require('grunt');

var options = require('./fixtures/options');

var files = require('./../tasks/lib/files')(grunt, options);

describe('files library', function () {
    describe('resolveAssetPath function', function () {
        it('should leave external assets as they are', function () {
            var external = '//maps.googleapis.com/maps/api/js';

            var result = files.resolveAssetPath(external);

            assert.deepEqual(result, external);
        });
    });
});

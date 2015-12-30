/* global require */

var assert = require('assert');
var grunt = require('grunt');

var options = require('./fixtures/options');

var files = require('./../tasks/lib/files')(grunt, options);

describe('files library', function () {
    describe('resolveAssetPath function', function () {
        it('should extract the asset path from symfony helper function', function () {
            var helper = "{{ asset('empty.css') }}";

            var result = files.resolveAssetPath(helper);

            assert.deepEqual(result, options.assetPath + 'empty.css');
        });

        it('should extract the asset path from symfony helper function, removing double slashes', function () {
            var helper = "{{ asset('/empty.css') }}";

            var result = files.resolveAssetPath(helper);

            assert.deepEqual(result, options.assetPath + 'empty.css');
        });

        it('should add the gruntfile relative path to the asset', function () {
            var asset = 'empty.css';

            var result = files.resolveAssetPath(asset);

            assert.deepEqual(result, options.assetPath + 'empty.css');
        });

        it('should add the gruntfile relative path to the asset, removing double slashes', function () {
            var asset = '/empty.css';

            var result = files.resolveAssetPath(asset);

            assert.deepEqual(result, options.assetPath + 'empty.css');
        });
    });

    describe('getInfo function', function () {
        it('should return NULL on external assets', function () {
            var external = '//maps.googleapis.com/maps/api/js';

            var result = files.getInfo(external);

            assert.deepEqual(result, null);
        });

        it('should return FALSE on unexisting file', function () {
            var file = 'unexisting.js';

            var result = files.getInfo(file);

            assert.deepEqual(result, false);
        });

        //it('ass', function () {
        //    assert(1);
        //});
    })
});

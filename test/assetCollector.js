/* global require */

var assert = require('assert');
var grunt = require('grunt');

var options = require('./fixtures/options');

var assetCollector = require('./../tasks/lib/assetCollector')(grunt, options);

describe('assetCollector library', function () {
    describe('Template with 1 empty css', function () {
        // the template path is relative to the Gruntfile
        var content = grunt.file.read('test/fixtures/tpl_with_empty_css.html');

        it('getAssets should find no js files', function () {
            // script regexp
            var assets = assetCollector.getAssets(options.regExps[0], content);

            assert(Array.isArray(assets));
            assert.deepEqual(assets.length, 0);
        });

        it('getAssets should return 1 css asset', function () {
            // css regexp
            var assets = assetCollector.getAssets(options.regExps[1], content);

            assert(Array.isArray(assets));
            assert.deepEqual(assets.length, 1);
            assert.deepEqual(assets[0], 'empty.css');
        });
    });

    describe('Template with various <link> tags', function () {
        // the template path is relative to the Gruntfile
        var content = grunt.file.read('test/fixtures/tpl_with_various_unexistant_css.html');

        it('getAssets should find no js assets', function () {
            // script regexp
            var assets = assetCollector.getAssets(options.regExps[0], content);

            assert(Array.isArray(assets));
            assert.deepEqual(assets.length, 0);
        });

        it('getAssets should return 3 css assets', function () {
            // css regexp
            var assets = assetCollector.getAssets(options.regExps[1], content);

            assert(Array.isArray(assets));
            assert.deepEqual(assets.length, 3);
        });
    });

    describe('Template with 1 empty js', function () {
        // the template path is relative to the Gruntfile
        var content = grunt.file.read('test/fixtures/tpl_with_empty_js.html');

        it('getAssets should return 1 js asset', function () {
            // script regexp
            var assets = assetCollector.getAssets(options.regExps[0], content);

            assert(Array.isArray(assets));
            assert.deepEqual(assets.length, 1);
            assert.deepEqual(assets[0], 'empty.js');
        });

        it('getAssets should find no css assets', function () {
            // css regexp
            var assets = assetCollector.getAssets(options.regExps[1], content);

            assert(Array.isArray(assets));
            assert.deepEqual(assets.length, 0);
        });
    });

    describe('Template with various <script> tags', function () {
        // the template path is relative to the Gruntfile
        var content = grunt.file.read('test/fixtures/tpl_with_various_unexistant_js.html');

        it('getAssets should return 3 js assets', function () {
            // script regexp
            var assets = assetCollector.getAssets(options.regExps[0], content);

            assert(Array.isArray(assets));
            assert.deepEqual(assets.length, 3);
        });

        it('getAssets should find no css assets', function () {
            // css regexp
            var assets = assetCollector.getAssets(options.regExps[1], content);

            assert(Array.isArray(assets));
            assert.deepEqual(assets.length, 0);
        });
    });
});

/* global require */

var assert = require('assert');
var grunt = require('grunt');
var _ = require('underscore');

var options = require('./fixtures/options');

var assetCollector = require('./../tasks/lib/assetCollector')(grunt, options);

describe('assetCollector library', function () {
    describe('getAssets function', function () {
        describe('Template with 1 empty css', function () {
            // the template path is relative to the Gruntfile
            var content = grunt.file.read(options.assetPath + 'tpl_with_empty_css.html');

            it('should find no js files', function () {
                // script regexp
                var assets = assetCollector.getAssets(options.regExps[0], content);

                assert(Array.isArray(assets));
                assert.deepEqual(assets.length, 0);
            });

            it('should return 1 css asset', function () {
                // css regexp
                var assets = assetCollector.getAssets(options.regExps[1], content);

                assert(Array.isArray(assets));
                assert.deepEqual(assets.length, 1);
                assert.deepEqual(assets[0], 'empty.css');
            });
        });

        describe('Template with various <link> tags', function () {
            // the template path is relative to the Gruntfile
            var content = grunt.file.read(options.assetPath + 'tpl_with_various_unexistant_css.html');

            it('should find no js assets', function () {
                // script regexp
                var assets = assetCollector.getAssets(options.regExps[0], content);

                assert(Array.isArray(assets));
                assert.deepEqual(assets.length, 0);
            });

            it('should return 3 css assets', function () {
                // css regexp
                var assets = assetCollector.getAssets(options.regExps[1], content);

                assert(Array.isArray(assets));
                assert.deepEqual(assets.length, 3);
            });
        });

        describe('Template with 1 empty js', function () {
            // the template path is relative to the Gruntfile
            var content = grunt.file.read(options.assetPath + 'tpl_with_empty_js.html');

            it('should return 1 js asset', function () {
                // script regexp
                var assets = assetCollector.getAssets(options.regExps[0], content);

                assert(Array.isArray(assets));
                assert.deepEqual(assets.length, 1);
                assert.deepEqual(assets[0], 'empty.js');
            });

            it('should find no css assets', function () {
                // css regexp
                var assets = assetCollector.getAssets(options.regExps[1], content);

                assert(Array.isArray(assets));
                assert.deepEqual(assets.length, 0);
            });
        });

        describe('Template with various <script> tags', function () {
            // the template path is relative to the Gruntfile
            var content = grunt.file.read(options.assetPath + 'tpl_with_various_unexistant_js.html');

            it('should return 3 js assets', function () {
                // script regexp
                var assets = assetCollector.getAssets(options.regExps[0], content);

                assert(Array.isArray(assets));
                assert.deepEqual(assets.length, 3);
            });

            it('should find no css assets', function () {
                // css regexp
                var assets = assetCollector.getAssets(options.regExps[1], content);

                assert(Array.isArray(assets));
                assert.deepEqual(assets.length, 0);
            });
        });
    });

    describe('getAssetsInfo function', function () {
        it('should return false if template is not found', function () {
            var tpl = options.assetPath + 'unexisting.html';

            var result = assetCollector.getAssetsInfo(tpl);

            assert.deepEqual(result, false);
        });

        describe('Template with 1 empty css', function () {
            it('should return an object with the assets info', function () {
                var tpl = options.assetPath + 'tpl_with_empty_css.html';

                var result = assetCollector.getAssetsInfo(tpl);

                assert.deepEqual(Object.keys(result).length, 1);
                assert(result.hasOwnProperty('empty.css'));
                assert(_.isObject(result['empty.css']));
                assert(result['empty.css'].hasOwnProperty('mtime'));
                assert(result['empty.css'].hasOwnProperty('content'));
                assert(result['empty.css'].hasOwnProperty('realPath'));
            });
        });

        describe('Template with external assets', function () {
            it('should return an empty object', function () {
                var tpl = options.assetPath + 'tpl_with_external_assets.html';

                var result = assetCollector.getAssetsInfo(tpl);

                assert.deepEqual(Object.keys(result).length, 0);
            });
        });
    });
});

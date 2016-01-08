/* global require */

var assert = require('assert');
var grunt = require('grunt');
var _ = require('underscore');

var options = require('./fixtures/options');

options.assetPath += '/update/';

var assetCollector = require('./../tasks/lib/assetCollector')(grunt, options);

describe('update task', function () {
    // the template path is relative to the Gruntfile
    var tpl = 'test/fixtures/update/tpl.html';

    var content = grunt.file.read(tpl);

    var assets = _.object([tpl], [assetCollector.getAssetsInfo(tpl)]);

    describe('getUpdatedAssets', function () {
        describe('no updates', function () {
            it('should return nothing if the min file has not been updated', function () {
                var updated = assetCollector.getUpdatedAssets(assets[tpl]);

                assert(Array.isArray(updated));
                assert.deepEqual(updated.length, 0);
            });
        });

        describe('css updated', function () {
            var minFile = options.assetPath + 'style.min.css';
            var originalMin = grunt.file.read(minFile);

            before(function () {
                var newMin = originalMin.replace(/body/, 'html');
                grunt.file.write(minFile, newMin);
            });

            it('should return the asset if the min file has been updated', function () {
                var updated = assetCollector.getUpdatedAssets(assets[tpl]);

                assert(Array.isArray(updated));
                console.log(updated);
                assert.deepEqual(updated.length, 1);
            });

            after(function () {
                grunt.file.write(minFile, originalMin);
            });
        });
    });
});

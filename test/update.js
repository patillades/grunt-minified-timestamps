/* global require */

var assert = require('assert');
var grunt = require('grunt');
var _ = require('underscore');

var options = require('./fixtures/options');

// this test suite is on a different folder, so we need to update the asset path
options.assetsPath += 'update/';

var assetCollector = require('./../tasks/lib/assetCollector')(grunt, options);
var files = require('./../tasks/lib/files')(grunt, options);

describe('update task', function () {
    // the template path is relative to the Gruntfile
    var tpl = 'test/fixtures/update/tpl.html';

    var assets = _.object([tpl], [assetCollector.getAssetsInfo(tpl)]);

    describe('no assets updated', function () {
        it('getUpdatedAssets should return nothing empty array', function () {
            var updated = assetCollector.getUpdatedAssets(assets[tpl], tpl);

            assert(Array.isArray(updated));
            assert.deepEqual(updated.length, 0);
        });
    });

    describe('css asset updated', function () {
        var minFile = options.assetsPath + 'style.min.css';
        // this is the minified asset called on the template
        var assetPathOnTpl = 'style.min.123.css';
        var originalMin;
        var updated;
        var updatedAssetsDetails;

        before(function () {
            originalMin = grunt.file.read(minFile);
            var newMin = originalMin.replace(/body/, 'html');
            grunt.file.write(minFile, newMin);

            updated = assetCollector.getUpdatedAssets(assets[tpl], tpl);
        });

        describe('getUpdatedAssets', function () {
            it('should return the asset if the min file has been updated', function () {
                assert(Array.isArray(updated));
                assert.deepEqual(updated.length, 1);
            });

            it('should get the file details', function () {
                updatedAssetsDetails = _.object(
                    updated,
                    updated.map(files.details)
                );

                assert(updatedAssetsDetails.hasOwnProperty(assetPathOnTpl));
                assert(
                    updatedAssetsDetails[assetPathOnTpl].newPath.indexOf(assetPathOnTpl) === -1,
                    'The new path of the asset has a different timestamp than the old one'
                );
            });
        });

        describe('delete old', function () {
            var assetContents;

            // keep the asset contents
            before(function () {
                assetContents = grunt.file.read(options.assetsPath + assetPathOnTpl);
            });

            it('should delete old assets', function () {
                assert(grunt.file.exists(options.assetsPath + assetPathOnTpl));

                _.each(updatedAssetsDetails, files.deleteOld);

                assert.deepEqual(grunt.file.exists(options.assetsPath + assetPathOnTpl), false);
            });

            // rewrite the file to keep the status quo
            after(function () {
                grunt.file.write(options.assetsPath + assetPathOnTpl, assetContents);
            });
        });

        describe('generate new timestamped asset', function () {
            it('should generate a new asset', function () {
                _.each(updatedAssetsDetails, files.timestamp);

                assert(grunt.file.exists(updatedAssetsDetails[assetPathOnTpl].newPath));
            });

            // delete the recently created file
            after(function () {
                grunt.file.delete(updatedAssetsDetails[assetPathOnTpl].newPath);
            });
        });

        describe('set the new timestamped asset on the template', function () {
            var tplContentBefore;

            before(function () {
                tplContentBefore = grunt.file.read(tpl);
            });

            it('should replace the asset path on the template', function () {
                assert.notEqual(-1, tplContentBefore.indexOf(assetPathOnTpl));

                assetCollector.updateAssetPaths(updatedAssetsDetails, assets[tpl], tpl);

                var tplContentAfter = grunt.file.read(tpl);

                assert.deepEqual(
                    -1,
                    tplContentAfter.indexOf(assetPathOnTpl),
                    'The original asset is not on the template anymore'
                );

                var newAssetPath = updatedAssetsDetails[assetPathOnTpl].newPath.replace(options.assetsPath, '');

                assert.notEqual(
                    -1,
                    tplContentAfter.indexOf(newAssetPath),
                    'The new path is found on the template'
                );
            });

            // restore the content of the template
            after(function () {
                grunt.file.write(tpl, tplContentBefore);
            });
        });

        // restore the contents of the min file
        after(function () {
            grunt.file.write(minFile, originalMin);
        });
    });
});

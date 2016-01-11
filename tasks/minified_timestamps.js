/* global module, require */
/*
 * grunt-minified-timestamps
 * https://github.com/patillades/gruntplugin
 *
 * Copyright (c) 2014 patillades
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('underscore');
var chalk = require('chalk');

module.exports = function(grunt) {
    // external modules
    var assetCollector;
    var files;
    // object that stores the various asset files found on each target
    var assets = {};

    grunt.registerMultiTask('minified_timestamps_getinfo',
        'Automatically update the version timestamps on the request for js and css minified files of your HTML templates',
        function()
    {
        grunt.event.on(
            'fileMissing',
            grunt.fatal.bind(null, 'Check for missing files', 3)
        );

        // Merge task-specific and/or target-specific options with default values provided on a plain object
        var options = this.options({
            // path where the assets are located, relative to the Gruntfile dir; it must always end in "/"
            assetPath: '/',
            // providing new regular expressions will overwrite the default ones, it's done this way because
            // concatenating the regExps in the options with the default ones would likely provide duplicate matches
            regExps: [
                // get the content of "src", the decimal point is there to match other attributes (e.g. type)
                // make sure it's a js file
                /<script.+src="(.+?\.js.*?)"/gi,
                // get the content of "href", the decimal point is there to match other attributes (e.g. rel, media)
                // avoid links with non-stylesheet rel tags
                /<link.+(?:rel="(?!canonical|alternate|icon)).+href="(.+?)"/gi
            ]
        });

        // load modules
        assetCollector = require('./lib/assetCollector')(grunt, options);
        files = require('./lib/files')(grunt, options);

        // for each task target (the different configuration values defined on the task, e.g. "default" or "spa"),
        // build a relational array whose keys are the templates containing assets
        // (the files specified in the "src" parameter of the mapping), with the information of those assets as values
        assets[this.target] = _.object(
            this.filesSrc,
            this.filesSrc.map(assetCollector.getAssetsInfo)
        );
    });

    grunt.registerMultiTask('minified_timestamps_updateinfo',
        'Automatically update the version timestamps on the request for js and css minified files of your HTML templates',
        function()
    {
        grunt.event.on(
            'fileMissing',
            grunt.fatal.bind(null, 'Check for missing files', 3)
        );

        grunt.log.subhead('Looking for changes since the ' + chalk.underline('"minified_timestamps_getinfo"') + ' task');

        // get the updated assets on all the templates of this target
        var updatedAssets = _.map(assets[this.target], assetCollector.getUpdatedAssets);

        // flatten the depth of the array and remove duplicates
        var uniqUpdatedAssets = _.uniq(
            _.flatten(updatedAssets)
        );

        // create an object with the assets as keys, and its details as values
        // (it's important to keep the details because each time the function is called generates a different timestamp,
        // so the calls to files.timestamp and assetCollector.updateAssetPaths need to use the same value)
        var updatedAssetsDetails = _.object(
            uniqUpdatedAssets,
            uniqUpdatedAssets.map(files.details)
        );

        // delete old timestamped assets
        _.each(updatedAssetsDetails, files.deleteOld);

        // generate a new timestamped version of the asset
        _.each(updatedAssetsDetails, files.timestamp);

        // for each template, set the new timestamp of each updated asset
        _.each(
            assets[this.target],
            assetCollector.updateAssetPaths.bind(null, updatedAssetsDetails)
        );
    });
};

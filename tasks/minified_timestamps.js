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
    var timestamp;
    // object that stores the various asset files found on each target
    var assets = {};

    grunt.registerMultiTask('minified_timestamps_getinfo',
        'Automatically update the version timestamps on the request for js and css minified files of your HTML templates',
        function()
    {
        // Merge task-specific and/or target-specific options with default values provided on a plain object
        var options = this.options({
            // path where the assets are located, relative to the Gruntfile dir
            assetPath: '/',
            // the default values are provided below, so they don't get overwritten
            regExps: []
        });

        // concat the default regular expressions to any that might be provided by the task
        options.regExps = options.regExps.concat([
            // get the content of "src", the decimal point is there to match other attributes (e.g. type)
            /<script.+src="(.+?)"/gi,
            // get the content of "href", the decimal point is there to match other attributes (e.g. rel, media)
            /<link.+href="(.+?)"/gi
        ]);

        // load modules
        assetCollector = require('./lib/assetCollector')(grunt, options);
        files = require('./lib/files')(grunt, options);
        timestamp = require('./lib/timestamp')(grunt, options);

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
        var target = this.target;
        // keep the details of the assets as they are updated, cause they might be present in more than one template
        var updated = {};

        grunt.log.subhead('Looking for changes since the ' + chalk.underline('"minified_timestamps_getinfo"') + ' task');

        // iterate through each template on the target
        // @todo rewrite this double loop, double if-else in a nicer way
        this.filesSrc.forEach(function (tplPath) {
            grunt.log.writeln('Looking for assets\' changes on file: ' + chalk.cyan(tplPath));

            var tplAssets = assets[target][tplPath];

            // iterate through each asset on the template
            _.each(tplAssets, function (oldInfo, assetPath) {
                var info = files.getInfo(assetPath);

                if (info === null) {
                    grunt.fatal('The file has been deleted', assetPath);
                // compare current file contents against the ones stored on the 'minified_timestamps_getinfo' task,
                } else if (info.content !== oldInfo.content) {
                    grunt.log.ok('This asset has changed: ' + chalk.green(assetPath));

                    // check if the asset has already been updated on another template before updating its timestamp
                    if (!updated.hasOwnProperty(info.realPath)) {
                        var newPath = timestamp.update(tplPath, assetPath);

                        // store the new asset path in case it is also present on other templates
                        // use the real path (the parent minified file) as the key, so in case there are templates with
                        // uncoordinated timestamps for a given asset, they'll all end up with the same
                        updated[info.realPath] = newPath;
                    } else {
                        // reuse details from a previous update
                        timestamp.update(tplPath, assetPath, updated[info.realPath]);
                    }
                }
            });
        });
    });
};

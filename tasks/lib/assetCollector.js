/* global module, require */

var _ = require('underscore');
var chalk = require('chalk');

module.exports = function (grunt, options) {
    'use strict';

    var files = require('./files')(grunt, options);

    /**
     * Run a regular expression recursively against the contents of a file and get all the asset paths matching it
     *
     * @param {RegExp} regex
     * @param {String} content
     * @param {Array} assets Optional, when not provided (the initial call) it defaults to an empty array
     *
     * @returns {Array} Strings with all the found asset paths
     */
    var getAssets = function(regex, content, assets) {
        if (typeof assets === 'undefined') {
            assets = [];
        }

        var result = regex.exec(content);

        if (result === null) {
            return assets;
        }

        // position 1 on the result array is the first capturing parenthesis of the regex, the one with the asset path
        assets.push(result[1]);

        // run the regular expression on the file as long as it finds matches
        // (since the regexps have the global "g" flag set)
        return getAssets(regex, content, assets);
    };

    /**
     * Get all the static assets on the submitted file
     *
     * @param {String} filepath Path for the HTML template for which we'll
     * be getting assets, it can be an absolute path or relative to the path
     * of the Gruntfile being executed
     *
     * @returns {Object|boolean} FALSE if the template was not found on the system, emit a "fileMissing" event
     * so the main task can abort with a fatal error.
     * Otherwise, relational array where the keys are asset paths and the values objects with
     * "mtime" (date of the file), "content" and "realPath" properties.
     *
     * Example:
     * {
     *   '/spa/css/style.landscape.min.1443003259344.css': {
     *     mtime: Wed Sep 23 2015 15:47:27 GMT+0200 (CEST),
     *     content: '.logo{display:none}...',
     *     realPath: '/spa/css/style.landscape.min.css'
     *   },
     *   ...
     * }
     */
    var getAssetsInfo = function(filepath) {
        grunt.log.writeln('Looking for assets on file: ' + chalk.cyan(filepath));

        try {
            // get the template's HTML content
            var content = grunt.file.read(filepath);
        } catch (e) {
            grunt.log.writeln(chalk.red('Template not found: ' + filepath));

            grunt.event.emit('fileMissing');

            return false;
        }

        // run all the regexes to get the assets on the template
        var fileAssetsArr = options.regExps.map(function (regExp) {
            return getAssets(regExp, content);
        });

        // fileAssetsArr is an array of arrays, so flatten it to an array of depth one
        var fileAssets = _.flatten(fileAssetsArr);

        // build an object of the form "assetPath" => info ({mtime, content, realPath})
        var data = _.object(
            fileAssets,
            fileAssets.map(files.getInfo)
        );

        // filter out the assets whose value is FALSE (files not found)
        var cleanData = _.pick(data, function (value, key, object) {
            return value !== false;
        });

        return cleanData;
    };

    return {
        // only returned for testing purposes
        getAssets: getAssets,
        getAssetsInfo: getAssetsInfo
    };
};

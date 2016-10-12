/* global module, require */

var _ = require('underscore');
var chalk = require('chalk');

module.exports = function (grunt, options) {
    var files = require('./files')(grunt, options);

    /**
     * Path of one of the templates declared on the task's configuration
     *
     * @typedef {String} TemplatePath
     */

    /**
     * Asset path as it's found on a template (e.g. '/spa/css/style.landscape.min.1443003259344.css')
     *
     * @typedef {String} AssetPath
     */

    /**
     * Run a regular expression recursively against the contents of a template file and get all the
     * asset paths matching it
     *
     * @param {RegExp} regex - regex that should match a static asset declared on an HTML template
     * @param {String} content - content of the HTML template where the regex will be searching
     * @param {AssetPath[]} [assets=[]] - On the initial call it defaults to an empty array
     *
     * @returns {AssetPath[]} Array of all the found asset paths
     */
    function getAssets(regex, content, assets) {
        if (typeof assets === 'undefined') {
            assets = [];
        }

        var result = regex.exec(content);

        // the regex found no result
        if (result === null) {
            return assets;
        }

        // run the regular expression on the file as long as it finds matches
        // (since the regexps have the global "g" flag set)
        //
        // add the first capturing parenthesis (the one with the asset path match) to the assets
        return getAssets(regex, content, assets.concat(result[1]));
    }

    /**
     * Get all the static assets on the submitted file.
     *
     * @param {TemplatePath} tplPath - Path for the HTML template for which we'll be getting assets,
     * it can be an absolute path or relative to the path of the Gruntfile being executed
     *
     * @returns {boolean|Object.<AssetPath, AssetInfo>} FALSE if the template is not found.
     * Otherwise, relational array where the keys are asset paths and the values AssetInfo objects
     *
     * Example:
     * {
     *   '/spa/css/style.landscape.min.1443003259344.css': {
     *     content: '.logo{display:none}...',
     *     realPath: '/spa/css/style.landscape.min.css'
     *   },
     *   ...
     * }
     */
    function getAssetsInfo(tplPath) {
        grunt.log.writeln('Looking for assets on file: ' + chalk.cyan(tplPath));

        try {
            // get the template's HTML content
            var content = grunt.file.read(tplPath);
        } catch (e) {
            return files.missingFile('Template', tplPath);
        }

        // run all the regexes to get the assets on the template
        var fileAssetsArr = options.regExps.map(regExp => getAssets(regExp, content));

        // fileAssetsArr is an array of arrays, so flatten it to an array of depth one
        var fileAssets = _.flatten(fileAssetsArr);

        // build an object of the form "AssetPath" => AssetInfo
        var data = _.object(
            fileAssets,
            fileAssets.map(files.getInfo)
        );

        // filter out the assets whose value is FALSE (files not found)
        return _.pick(data, value => value !== false);
    }

    /**
     * Take the assets on a given template and filter them to the ones that have been updated
     *
     * @param {Object.<AssetPath, AssetInfo>} tplAssets
     * @param {TemplatePath} tplPath - Path of the template where the assets' sources will be updated
     * @returns {AssetPath[]} The paths of the updated assets, as they are written on the template
     */
    function getUpdatedAssets(tplAssets, tplPath) {
        grunt.log.writeln('Looking for assets\' changes on file: ' + chalk.cyan(tplPath));

        var updated = [];

        _.each(tplAssets, (assetInfo, assetPath) => {
            if (files.hasChanged(assetInfo, assetPath)) {
                grunt.log.ok('This asset has changed: ' + chalk.green(assetPath));

                updated.push(assetPath);
            }
        });

        return updated;
    }

    /**
     * Check if a template contains updated assets, and if so update those assets with the new
     * minified timestamp
     *
     * @param {AssetsDetails} updatedAssets - Assets that have been updated and need a new
     * timestamped source on the template
     * @param {Object.<AssetPath, AssetInfo>} tplAssets - Associative array of assets on the given template
     * @param {TemplatePath} tplPath - Path of the template where the assets' sources will be updated
     */
    function updateAssetPaths(updatedAssets, tplAssets, tplPath) {
        var assetsInThisTpl = _.filter(
            updatedAssets,
            (assetDetails, assetPath) => tplAssets.hasOwnProperty(assetPath)
        );

        assetsInThisTpl.forEach(
            assetDetails => files.updateAssetOnTemplate(tplPath, assetDetails)
        );
    }

    return {
        // only returned for testing purposes
        getAssets: getAssets,
        getAssetsInfo: getAssetsInfo,
        getUpdatedAssets: getUpdatedAssets,
        updateAssetPaths: updateAssetPaths
    };
};

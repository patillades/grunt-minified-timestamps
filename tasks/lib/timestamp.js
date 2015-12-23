/* global module, require */

module.exports = function (grunt, options) {
    'use strict';

    var files = require('files')(grunt, options);

    /**
     * Update the timestamp of an asset on a given template
     *
     * @param {String} tplPath The path of the template file for which the assets' timestamps will be updated
     * @param {String} assetPath The asset path declared inside the template whose update is being checked
     * @param {String} newPath Optional. When provided, it means that the asset has already been updated
     * on a different template, so there's no need to look for old files or generate a new timestamp. Instead,
     * the path of the new timestamped asset will get this value
     *
     * @returns {Object} The details of the asset, so they can be reused
     */
    var update = function(tplPath, assetPath, newPath) {
        var content = grunt.file.read(tplPath);

        var details = files.details(assetPath);

        // if the new path is unknown, it means that this asset has not been updated on any other template
        if (typeof newPath === 'undefined') {
            // delete old minified versions of the asset
            files.deleteOld(details);
            // generate a new timestamped version of the asset
            files.timestamp(details);

            newPath = details.newPath;
        }

        // rewrite the template with the new timestamped asset path
        grunt.file.write(
            tplPath, content.replace(
                details.tplRegExp,
                newPath.replace(options.assetPath, '')
            )
        );

        return newPath;
    };

    return {
        update: update
    };
};

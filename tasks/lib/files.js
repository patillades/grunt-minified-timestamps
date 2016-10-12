/* global module, require */

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

module.exports = function (grunt, options) {
    /**
     * Object storing the info of a given asset
     *
     * @typedef {Object} AssetInfo
     * @property {String} content - content of the asset
     * @property {String} realPath - real path where the asset file is located
     */

    /**
     * Get the asset info, specifically the last modified time and its
     * contents, if the file exists
     *
     * @param {AssetPath} assetPath
     *
     * @returns {boolean|AssetInfo} FALSE if the path belongs to an external file, or was not found
     * on the system. When the file is found, an object with "content" (file content), and
     * "realPath" (if the asset is timestamped, the parent minified file path) properties
     */
    function getInfo(assetPath) {
        if (isExternal(assetPath)) {
            grunt.log.writeln('  - No info for external file: ' + chalk.yellow(assetPath));

            return false;
        }

        var resolvedPath = resolveAssetPath(assetPath);

        // make sure that the asset file exists
        if (!grunt.file.exists(resolvedPath)) {
            return missingFile('Asset', resolvedPath);
        }

        // remove the timestamp (if there's one) to get the info on the parent file;
        // this way we can compare if a file has been updated on the minification tasks
        // e.g. gruntfile/relative/path/style.min.123.css -> gruntfile/relative/path/style.min.css
        var realPath = resolvedPath.replace(/\.min\.\d+\./, '.min.');

        // try/catch because an exception is thrown for files not found (checked once for
        // resolvedPath, now for realPath)
        try {
            // check file existence
            fs.statSync(realPath);

            return {
                content: grunt.file.read(realPath),
                realPath
            };
        } catch (e) {
            return missingFile('Asset', realPath);
        }
    }

    /**
     * Emit a "fileMissing" event so the main task can abort with a fatal error if a file is not
     * found.
     *
     * @fires EventEmitter#fileMissing
     * @event EventEmitter#fileMissing
     *
     * @param {String} fileType
     * @param {String} filePath
     * @returns {boolean}
     */
    function missingFile(fileType, filePath) {
        grunt.log.writeln(chalk.red(fileType + ' not found: ' + filePath));

        grunt.event.emit('fileMissing');

        return false;
    }

    /**
     * Tell whether an asset is external to the file system, checking if it starts by "http",
     * "https", or "//"
     *
     * @param {AssetPath} assetPath
     * @returns {boolean}
     */
    function isExternal(assetPath) {
        return /^(http(s)?:)?\/\//.test(assetPath);
    }

    /**
     * Translate the asset path found on the template, to the path relative to the Gruntfile.
     * Get the asset path from symfony helper calls if they are used
     *
     * @param {AssetPath} assetPath
     * @returns {String} The real asset path on the filesystem (relative to the Grunfile)
     */
    function resolveAssetPath(assetPath) {
        var cleanPath = getPathFromSymfonyAssetCall(assetPath);

        // add the asset path and make sure there are no double slashes
        // (happens when the asset is declared like src="/file.ext")
        return (options.assetsPath + cleanPath).replace('//', '/');
    }

    /**
     * If the asset path is a helper call used on the symfony templates
     * (e.g. {{ asset('relative/file/path') }}), get the real path out of it. Otherwise, return
     * the path as it is
     *
     * @param {AssetPath} assetPath
     * @returns {String}
     */
    function getPathFromSymfonyAssetCall(assetPath) {
        var result = /^{{\s*asset\(['"](.+)['"]\)\s*}}$/i.exec(assetPath);

        if (result === null) {
            return assetPath;
        }

        return result[1];
    }

    /**
     * Compare the updated info of an asset to see if it has changed compared to the provided data
     *
     * @param {AssetInfo} oldInfo
     * @param {AssetPath} assetPath
     * @returns {boolean}
     */
    function hasChanged(oldInfo, assetPath) {
        var info = getInfo(assetPath);

        return info.content !== oldInfo.content;
    }

    /**
     * Details of a given asset file
     *
     * @typedef {Object} AssetDetails
     * @property {String} dir - Directory where the asset is located (relative to the Gruntfile)
     * @property {String} uglified - Path of the uglified asset
     * @property {String} newPath - Path where the new uglified and timestamped asset will be
     * located
     * @property {RegExp} tplRegExp - Regex to find the asset call on the template
     * @property {RegExp} oldAssetsRegExp - Regex to find the old timestamped versions of the asset
     */

    /**
     * Return the details of a file needed to delete its old timestamped versions and generate a
     * new one
     *
     * @param {AssetPath} assetPath
     * @returns {AssetDetails}
     */
    function details(assetPath) {
        var realPath = resolveAssetPath(assetPath);

        var parsed = path.parse(realPath);

        var lastDot = parsed.base.lastIndexOf('.');

        // remove the extension and the timestamp
        var fileWoutExtension = parsed.base.substr(0, lastDot).replace(/min\.\d+/, 'min');

        var tplRegExp = new RegExp(
            realPath.replace(options.assetsPath, '')
        );

        var oldAssetsRegExp = new RegExp(
            parsed.dir + '\/' + fileWoutExtension.replace('.', '\\.') + '\\.\\d+\\' + parsed.ext
        );

        return {
            dir: parsed.dir,
            uglified: parsed.dir + '/' + fileWoutExtension + parsed.ext,
            newPath:  parsed.dir + '/' + fileWoutExtension + '.' + Date.now() + parsed.ext,
            tplRegExp,
            oldAssetsRegExp
        };
    }

    /**
     * Delete all previous versions (file.min.123.js) of a given minified asset (file.min.js) found
     * inside its folder
     *
     * @param {AssetDetails} asset
     */
    function deleteOld(asset) {
        grunt.file.recurse(asset.dir, function (abspath) {
            if (asset.oldAssetsRegExp.test(abspath)) {
                grunt.log.writeln('    - Deleting old timestamped asset: ' + chalk.red(abspath));

                grunt.file.delete(abspath);
            }
        });
    }

    /**
     * Make a timestamped copy of the uglified asset
     *
     * @param {AssetDetails} asset
     */
    function timestamp(asset) {
        grunt.file.copy(asset.uglified, asset.newPath);
    }

    /**
     * Rewrite a template with the new timestamped path of a given asset
     *
     * @param {TemplatePath} tplPath
     * @param {AssetDetails} assetDetails
     */
    function updateAssetOnTemplate(tplPath, assetDetails) {
        var content = grunt.file.read(tplPath);

        grunt.file.write(
            tplPath, content.replace(
                assetDetails.tplRegExp,
                assetDetails.newPath.replace(options.assetsPath, '')
            )
        );
    }

    return {
        details: details,
        getInfo: getInfo,
        deleteOld: deleteOld,
        timestamp: timestamp,
        hasChanged: hasChanged,
        missingFile: missingFile,
        updateAssetOnTemplate: updateAssetOnTemplate,
        // only returned for testing purposes
        resolveAssetPath: resolveAssetPath
    };
};

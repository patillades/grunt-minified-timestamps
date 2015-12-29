/* global module */

module.exports = {
    // path where the assets are located, relative to the Gruntfile dir
    assetPath: 'test/fixtures/',
    regExps: [
        // get the content of "src", the decimal point is there to match other attributes (e.g. type)
        /<script.+src="(.+?)"/gi,
        // get the content of "href", the decimal point is there to match other attributes (e.g. rel, media)
        /<link.+href="(.+?)"/gi
    ]
};

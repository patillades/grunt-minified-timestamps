module.exports = {
    // path where the assets are located, relative to the Gruntfile dir
    assetPath: 'test/fixtures/',
    // one regular expression for js and the other 2 for css assets, the
    // real information is between one optional {{ statics_path }} field
    // and one optional query string
    regExps: [
        /<script src="({{\s*statics_path\s*}})?\s*(.+?)(\?.+)?"><\/script>/gi,
        /<link rel="stylesheet" href="({{\s*statics_path\s*}})?\s*(.+?)(\?.+)?"\s*\/>/gi,
        /<link href="({{\s*statics_path\s*}})?\s*(.+?)(\?.+)?" (media=".+" )?rel="stylesheet"\s*\/>/gi
    ]
};

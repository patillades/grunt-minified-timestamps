# Grunt cache busting module for Symfony2

This Grunt module allows you to cache bust static css and js files (also called assets) on a
Symfony2 project.

## How does it work?

This module is composed of two tasks, the first one is called `minified_timestamps_getinfo` and it
takes an array of template files containing assets on them. When executed, it reads the template
files, and stores in memory the content of the assets found there.

The second task, `minified_timestamps_updateinfo`, must be executed after all preprocessor or
minification tasks, and it checks if the content of the assets has changed. If that's the case,
it deletes the old timestamped versions of the assets, creates new ones with the current time
(calling `Date.now()`) and rewrites the templates so they are up to date with the latest version
of the assets.

##Usage

This module is able to locate assets declared in the following ways, provided that they are all
located on an `assetPath` that has to be declared on the task's `options`:

* `<script src="{{ asset('js/jquery-2.1.4.min.js') }}"></script>`
* `<script src="/js/sockjs-0.3.min.js"></script>`
* `<link rel="stylesheet" href="{{ asset('css/style.css') }}"/>`
* `<link rel="stylesheet" href="/css/style.css" />`

This is how the `Gruntfile` will look like:

    module.exports = function(grunt) {
        var timestampsConfig = {
            default: {
                src: ['app/Resources/views/base.html.twig']
            },
            options: {
                // path where the assets are located, relative to the Gruntfile dir
                // (by default, "/")
                assetPath: 'web/',
                // this are the default regular expressions used by the plugin to capture js and
                // css assets, if you overwrite them make sure to capture the asset source with
                // the first capturing parenthesis
                regExps: [
                    // get the content of "src", the decimal point is there to match other attributes (e.g. type)
                    // make sure it's a js file
                    /<script.+src="(.+?\.js.*?)"/gi,
                    // get the content of "href", the decimal point is there to match other attributes (e.g. rel, media)
                    // avoid links with non-stylesheet rel tags
                    /<link.+(?:rel="(?!canonical|alternate|icon))?.*href="(.+?)"/gi
                ]
            }
        };

        grunt.initConfig({
            minified_timestamps_getinfo: timestampsConfig,
            minified_timestamps_updateinfo: timestampsConfig,
            uglify: {
                default: {
                    files: {
                        'web/js/script.min.js': ['web/js/script.js']
                    }
                }
            },
            cssmin: {
                default: {
                    files: {
                        'web/css/style.min.css': ['web/css/style.css']
                    }
                }
            }
        });

        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-contrib-cssmin');
        grunt.loadNpmTasks('grunt-minified-timestamps');

        grunt.registerTask(
            'default',
            [
                'minified_timestamps_getinfo',
                'uglify',
                'cssmin',
                'minified_timestamps_updateinfo'
            ]
        );
    };
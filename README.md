# Grunt cache busting plugin

This Grunt module allows you to cache bust static css and js files, also called assets.

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

    module.exports = function(grunt) {
        // using Compact Format (http://gruntjs.com/configuring-tasks#compact-format) for a a single src-dest
        // (source-destination) file mapping per-target
        var timestampsConfig = {
            default: {
                src: ['src/index.html']
            }
        };

        grunt.initConfig({
            minified_timestamps_getinfo: timestampsConfig,
            minified_timestamps_updateinfo: timestampsConfig,
            uglify: {
                default: {
                    files: {
                        'src/script.min.js': ['src/script.js'],
                    }
                }
            },
            cssmin: {
                default: {
                    files: {
                        'src/style.min.css': ['src/style.css'],
                    }
                }
            },
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
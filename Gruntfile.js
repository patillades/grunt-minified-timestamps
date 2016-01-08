'use strict';

module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        mochaTest: {
            getInfo: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/assetCollector.js', 'test/files.js']
            },
            updateInfo: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/update.js']
            }
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('test', ['mochaTest:getInfo', 'mochaTest:updateInfo']);
};

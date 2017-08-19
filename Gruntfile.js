/**
 *  @References
 * [0] http://gruntjs.com/getting-started to install grunt-cli
 * [1]: https://github.com/01org/grunt-zipup
 * [2]: https://github.com/gruntjs/grunt-contrib-handlebars
 * [3]: http://gruntjs.com/configuring-tasks#files
 **/

module.exports = function (grunt) {
  grunt.initConfig({
    zipup: {
      package: {
        appName: 'GenPass',
        version: '0.0.2',
        files: [
          { cwd: 'extension/src', src: '**', expand: true, dest: 'src' },
          { cwd: 'extension/resources', src: '**', expand: true, dest: 'resources' },
          { src: 'extension/manifest.json', dest: 'manifest.json' }
        ],
        outDir: 'extension/builds'
      }
    }
  });

  grunt.loadNpmTasks('grunt-zipup');

  grunt.registerTask('release-chrome', ['zipup']);
};

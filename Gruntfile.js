module.exports = function(grunt) {
  var config = {
    uglify: {
      bookmarklet: {
        files: {
          'bookmarklet/elemental-bookmarklet.min.js': 'bookmarklet/elemental-bookmarklet.js'
        }
      }
    }
  };

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-contrib-uglify');
};

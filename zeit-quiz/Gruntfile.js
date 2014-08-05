module.exports = function( grunt ) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),
		bower: {
			target: {
				rjsConfig: 'src/js/main.js'
			},
			options: {
				exclude: ['modernizr', 'requirejs']
			}
		},
		requirejs: {
			options: {
				keepBuildDir: true,
				baseUrl: 'src/js/',
				mainConfigFile: 'src/js/main.js',
				out: 'build/js/main.js',
				name: 'main',
				paths: {
					'requireLib': '../../bower_components/requirejs/require'
				},
				include: ['requireLib'],
				generateSourceMaps: false,
				preserveLicenseComments: false
			},
			dev: {
				options: {
					optimize: 'none'
				}
			},
			dist: {
				options: {
					optimize: 'uglify2'
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: {
				src: [
					'src/**/*.js'
				]
			}
		},
		copy: {
			css: {
				expand: true,
				flatten: true,
				filter: 'isFile',
				src: 'bower_components/**/*.css',
				dest: 'build/css/'
			},
			fonts: {
				expand: true,
				cwd: 'src/',
				src: 'fonts/**',
				dest: 'build/'
			},
			images: {
				expand: true,
				cwd: 'src/sass/',
				src: 'icons/*',
				dest: 'build/css/'
			},
			html: {
				expand: true,
				cwd: 'src/',
				src: '*.html',
				dest: 'build/'
			}
		},
		compass: {
			options: {
				httpFontsPath: '../fonts',
				sassDir: 'src/sass',
				cssDir: 'build/css'
			},
			dev: {
				options: {
					debugInfo: true,
					environment: 'development',
					outputStyle: 'expanded'
				}
			},
			dist: {
				options: {
					debugInfo: false,
					environment: 'production',
					outputStyle: 'compact' // nested (default), compact, compressed, or expanded.
				}
			}
		},
		watch: {
			options: {
				livereload: true,
			},
			html: {
				files: [ 'src/*.html' ],
				tasks: 'copy:html'
			},
			scripts: {
				files: [ '<%= jshint.all.src %>' ],
				tasks: 'scripts'
			},
			styles: {
				files: [ 'src/sass/**/*.scss' ],
				tasks: 'compass:dev'
			},
			config: {
				files: [ 'Gruntfile.js' ],
				tasks: 'default'
			}
		}
	});

	// Load required plugins
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-bower-requirejs');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-copy');

	// Default grunt
	grunt.registerTask( 'scripts', [ 'jshint', 'requirejs:dev'] );
	grunt.registerTask( 'default', [ 'jshint', 'requirejs:dist', 'bower', 'compass:dist', 'copy'] );
};

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

		jscs: {
			options: {
				config: '.jscsrc',
				excludeFiles: '<%= jshint.options.ignores %>'
			},
			all: {
				src: '<%= jshint.all.src %>'
			}
		},

		copy: {
			css: {
				expand: true,
				flatten: true,
				filter: 'isFile',
				src: [ 'bower_components/**/*.css', 'src/fonts/fira/fira.css' ],
				dest: 'build/css/',
				options: {
					process: function (content, srcpath) {
						if ( /fira.css$/.test( srcpath ) ) {
							return content.replace(/url\('/g, "url('../fonts/fira/");
						} else {
							return content;
						}
					}
				}
			},
			fonts: {
				expand: true,
				cwd: 'src/fonts',
				src: [
					'**',
					'!fira/*',
					'!fira/source/**',
					'!**/technical reports/**'
				],
				dest: 'build/fonts'
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
				fontsDir: 'src/fonts',
				httpFontsPath: '../fonts',
				sassDir: 'src/sass',
				cssDir: 'build/css'
			},
			dev: {
				options: {
					sourcemap: true,
					environment: 'development',
					outputStyle: 'expanded'
				}
			},
			dist: {
				options: {
					environment: 'production',
					outputStyle: 'compressed'
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
				files: [
					'.jscsrc',
					'.jshintrc',
					'bower.json',
					'Gruntfile.js'
				],
				options: {
					reload: true
				}
			}
		}
	});

	// Load required plugins
	grunt.loadNpmTasks('grunt-bower-requirejs');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jscs');

	// Default grunt
	grunt.registerTask( 'lint', [ 'jshint', 'jscs' ] );
	grunt.registerTask( 'scripts', [ 'lint', 'requirejs:dev' ] );
	grunt.registerTask( 'default', [ 'lint', 'bower', 'requirejs:dist', 'copy', 'compass:dist' ] );
};

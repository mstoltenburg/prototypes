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

		clean:{
			// cleanup minified SVGs, remove orphaned files
			svg: [ '<%= svgmin.svg.dest %>' ]
		},

		svgmin: {
			svg: {
				expand: true,
				cwd: 'src/sass/svg',
				src: [ '*.svg' ],
				dest: 'src/sass/svg/_minified'
			}
		},

		svgstore: {
			options: {
				prefix : 'svg-',
				cleanup: [ 'fill', 'stroke', 'stroke-width' ],
				includedemo: true,
				formatting: {
					indent_size: 1,
					indent_char: '	'
				}
			},
			svg: {
				src: '<%= svgmin.svg.dest %>/*.svg',
				dest: 'build/css/svg/icons.svg'
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
				src: 'icons/**/*',
				dest: 'build/css/'
			},
			data: {
				expand: true,
				cwd: 'src',
				src: [ '*.html', 'data/*.json' ],
				dest: 'build'
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
			data: {
				files: [ 'src/*.html', 'src/data/*.json' ],
				tasks: 'copy:data'
			},
			scripts: {
				files: [ '<%= jshint.all.src %>' ],
				tasks: 'scripts'
			},
			styles: {
				files: [ 'src/sass/**/*.scss' ],
				tasks: 'compass:dev'
			},
			images: {
				files: [ 'src/sass/icons/**/*' ],
				tasks: 'copy:images'
			},
			svg: {
				files: [ '<%= svgmin.svg.cwd %>/*.svg' ],
				tasks: [ 'svg' ]
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
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-svgmin');
	grunt.loadNpmTasks('grunt-svgstore');

	// Register tasks
	grunt.registerTask( 'svg', [ 'clean', 'svgmin', 'svgstore' ] );
	grunt.registerTask( 'lint', [ 'jshint', 'jscs' ] );
	grunt.registerTask( 'scripts', [ 'lint', 'requirejs:dev' ] );
	grunt.registerTask( 'default', [ 'lint', 'bower', 'requirejs:dist', 'copy', 'compass:dist' ] );
};

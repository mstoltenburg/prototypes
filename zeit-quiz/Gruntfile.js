module.exports = function( grunt ) {
	"use strict";

	grunt.initConfig({
		pkg: grunt.file.readJSON( "package.json" ),
		bower: {
			target: {
				rjsConfig: "src/js/main.js"
			},
			options: {
				exclude: ["modernizr", "requirejs"]
			}
		},
		requirejs: {
			options: {
				keepBuildDir: true,
				baseUrl: "src/js/",
				mainConfigFile: "src/js/main.js",
				out: "build/js/main.js",
				name: "main",
				paths: {
					'requireLib': '../../bower_components/requirejs/require'
				},
				include: ['requireLib'],
				generateSourceMaps: false,
				preserveLicenseComments: false
			},
			dev: {
				options: {
					optimize: "none"
				}
			},
			dist: {
				options: {
					optimize: "uglify2"
				}
			}
		},
		jshint: {
			all: {
				src: [
					"src/**/*.js"
				],
				options: {
					"curly": true,
					"eqeqeq": true,
					"eqnull": true,
					"expr": true,
					"immed": true,
					"noarg": true,
					"onevar": true,
					"quotmark": "double",
					"smarttabs": true,
					"trailing": true,
					"undef": true,
					"unused": true,
					"node": true,
					"browser": true,
					"devel": true,
					"globals": {
						"TextSearch": true,
						"Matrices": true
					}
				}
			}
		},
		copy: {
			css: {
				expand: true,
				cwd: "src/",
				src: "css/*",
				dest: "build/"
			},
			html: {
				expand: true,
				cwd: "src/",
				src: "*.html",
				dest: "build/"
			}
		},
		compass: {
			options: {
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
					outputStyle: 'compressed'
				}
			}
		},
		watch: {
			options: {
				livereload: true,
			},
			html: {
				files: [ "src/*.html" ],
				tasks: "copy:html"
			},
			scripts: {
				files: [ "<%= jshint.all.src %>" ],
				tasks: "scripts"
			},
			styles: {
				files: [ "src/sass/*.scss" ],
				tasks: "compass"
			},
			config: {
				files: [ "Gruntfile.js" ],
				tasks: "default"
			}
		}
	});

	// Load required plugins
	grunt.loadNpmTasks("grunt-contrib-requirejs");
	grunt.loadNpmTasks('grunt-bower-requirejs');
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-compass");
	grunt.loadNpmTasks("grunt-contrib-copy");

	// Default grunt
	grunt.registerTask( "scripts", [ "jshint", "requirejs:dev"] );
	grunt.registerTask( "default", [ "jshint", "requirejs:dev", "bower", "compass", "copy"] );
};

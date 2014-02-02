module.exports = function( grunt ) {
	"use strict";

	grunt.initConfig({
		pkg: grunt.file.readJSON( "package.json" ),
		jshint: {
			all: {
				src: [
					"src/**/*.js", "test/**/*.js"
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
						"jQuery": true,
						"TextSearch": true
					}
				}
			}
		},
		uglify: {
			all: {
				files: {
					"build/js/zeit.min.js": [ "src/js/text-search.js", "src/js/zeit.js" ]
				},
				options: {
					preserveComments: false,
					report: "min"
				}
			}
		},
		qunit: {
			all: [ "test/**/*.html" ]
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
		sass: {
			all: {
				options: {
					style: "expanded"
				},
				files: {
					"build/css/zeit.css": "src/sass/zeit.scss"
				}
			}
		},
		watch: {
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
				tasks: "sass"
			},
			tests: {
				files: [ "test/*.html", "test/*.js" ],
				tasks: "qunit"
			}
		}
	});

	// Load required plugins
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-qunit");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-copy");

	// Default grunt
	grunt.registerTask( "scripts", [ "jshint", "uglify"] );
	grunt.registerTask( "default", [ "jshint", "uglify", "sass", "copy"] );
};

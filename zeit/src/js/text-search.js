(function(window) {
	"use strict";

	var TextSearch = function () {
		this.init.apply(this, arguments);
	};

	TextSearch.prototype = {
		maxInputLength: 200000,
		input: null,
		text: null,
		words: 0,
		counter: null,
		query: [],
		errors: [],
		result: null,

		init: function(input) {
			this.input = input.trim();
			this.text = null;
			this.words = 0;
			this.counter = null;
			this.query = [];
			this.errors = [];
			this.result = null;

			this.parseInput();
			this.checkInput();
			this.searchText();
		},

		parseInput: function() {
			var re = /([^]+?)\n(\d+)\n([^]+)/,
				found = this.input.match(re);

			if (found) {
				this.text = found[1];
				this.words = this.countWords(this.text);
				this.counter = parseInt(found[2], 10);
				this.query = found[3].split("\n");
			} else {
				this.errors.push("Die Eingabe entspricht nicht dem Eingabeformat.");
			}
		},

		checkInput: function() {
			if (this.input.length > this.maxInputLength) {
				this.errors.push("Die Anzahl der eingegebenen Zeichen darf nicht größer als " + this.maxInputLength + " sein.");
			}
			if (this.query.length >= this.words) {
				this.errors.push("Die Anzahl der Suchworte muss kleiner als die Anzahl der Wörter des zu durchsuchenden Text sein.");
			}
			if (this.counter !== this.query.length) {
				this.errors.push("Die angegebene Anzahl der Suchworte (" + this.counter + ") entspricht nicht der Anzahl eingegebener Suchworte (" + this.query.length + ").");
			}
		},

		countWords: function(txt) {
			var words = txt.match(/\S+/g);

			return words ? words.length : 0;
		},

		searchText: function() {
			var firstWord = this.query[0],
				startSearch = new RegExp("\\b" + firstWord + "\\b", "gi"),
				re = new RegExp("\\b" + this.query.join("\\b[^]+?\\b") + "\\b", "gi"),
				source,
				hit;

			// find all occurrences of the first word to get nested constructs
			while ((source = startSearch.exec(this.text)) !== null) {
				// start searching the text at index of current match
				re.lastIndex = source.index;
				hit = re.exec(this.text);

				if (hit !== null) {
					if (!this.result || this.countWords(hit[0]) < this.countWords(this.result)) {
						this.result = hit[0];
					}
				}
			}
		},

		getResult: function() {
			if (this.result) {
				return this.result;
			} else {
				return "Kein Abschnitt gefunden.";
			}
		}
	};

	window.TextSearch = TextSearch;

})(window);

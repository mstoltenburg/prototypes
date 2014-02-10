(function(window) {
	"use strict";

	var Matrices = function () {
		this.init.apply(this, arguments);
	}, Matrix = function () {
		this.init.apply(this, arguments);
	};

	Matrices.prototype = {
		input: null,
		entities: null,
		errors: null,
		maxMatrices: 5,
		maxColumns: 1008,

		init: function(input) {
			this.input = input.trim();
			this.entities = [];
			this.errors = [];

			this.parseInput();
		},

		parseInput: function() {
			var rows = this.input.replace(/[^\d\n]/g, "").split("\n"),
				count = parseInt(rows.shift(), 10),
				i, m, x;

			if (count > this.maxMatrices) {
				this.errors.push("Die Anzahl eingegebener Matrizen darf nicht größer als " + this.maxMatrices + " sein.");
				return;
			}

			for (; count; --count) {
				x = parseInt(rows.shift(), 10);
				m = [];

				if (x > this.maxColumns) {
					this.errors.push("Eine Matrix darf maximal " + this.maxColumns + " Reihen und Spalten enthalten.");
					return;
				}

				for (i = 0; i < x; i++) {
					m[i] = rows.shift().split("");
				}

				this.entities.push(new Matrix(m));
			}
		},

		getResult: function() {
			var results = [],
				i, l;

			for (i = 0, l = this.entities.length; i < l; i++) {
				results.push(this.entities[i].getResult());
			}

			return results.join("\n");
		}
	};

	Matrix.prototype = {
		length: null,
		data: null,
		computed: null,
		units: null,

		init: function(data) {
			this.length = data[0].length;
			this.data = data;
			this.computed = [];
			this.units = 0;

			this.countUnits();
		},

		countUnits: function() {
			var x, y;

			for (x = 0; x < this.length; x++) {
				for (y = 0; y < this.length; y++) {
					if (!this.isComputed(x, y) && this.isOne(x, y)) {
						this.units++;
						this.checkElement(x, y);
					}
				}
			}
		},

		checkElement: function(x, y) {
			if (this.isComputed(x, y) || x < 0 || x > this.length - 1 || y < 0 || y > this.length - 1) {
				return;
			}

			this.setComputed(x, y);

			if (this.isOne(x, y)) {
				this.checkNeighbours(x, y);
			}
		},

		checkNeighbours: function(x, y) {
			var n;

			if (x > 0) {
				n = x - 1;
				this.checkElement(n, y-1);
				this.checkElement(n, y);
				this.checkElement(n, y+1);
			}

			this.checkElement(x, y-1);
			this.checkElement(x, y+1);

			if (x < this.length - 1) {
				n = x + 1;
				this.checkElement(n, y-1);
				this.checkElement(n, y);
				this.checkElement(n, y+1);
			}
		},

		isOne: function(x, y) {
			return !!parseInt(this.data[x][y], 10);
		},

		isComputed: function(x, y) {
			return this.computed[x] && this.computed[x][y];
		},

		setComputed: function(x, y) {
			if (!this.computed[x]) {
				this.computed[x] = [];
			}

			this.computed[x][y] = true;
		},

		getResult: function() {
			return this.units;
		}
	};

	window.Matrices = Matrices;
	window.Matrix = Matrix;

})(window);
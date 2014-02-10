module( "Aufgabe 2" );

test("Matrix Test", function() {
	var simple = document.querySelectorAll("div#matrix div"),
		i, m,
		value = "hello";

	for (i = simple.length - 1; i >= 0; i--) {
		m = new Matrices(simple[i].textContent);
		equal(m.getResult(), simple[i].dataset.units);
	}

	m = new Matrix([["0"]]);
	strictEqual(m.isOne(0, 0), false);

	m = new Matrix([["1"]]);
	strictEqual(m.isOne(0, 0), true);

});

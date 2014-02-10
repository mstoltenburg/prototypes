module( "Aufgabe 1" );

test("Text Search Test", function() {
	var el = document.getElementById("textSearch"),
		ts = new TextSearch(el.textContent);

	equal(ts.getResult(), "ein Beispieltext, der ein paar Wörter", "kürzester Textabschnitt, welcher alle gegebenen Wörter enthält");
});

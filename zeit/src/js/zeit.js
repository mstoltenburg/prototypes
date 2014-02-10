(function() {
	"use strict";

	function searchText(e) {
		e.preventDefault();
		e.stopPropagation();

		var ts = new TextSearch(e.currentTarget.elements.searchText.value),
			el = document.getElementById("searchResult"),
			re = new RegExp(ts.result),
			i;

		el.innerHTML = "";
		el.insertAdjacentHTML("beforeend", "<p class='result'>" + ts.getResult() + "</p>");

		if (ts.result) {
			el.insertAdjacentHTML("beforeend", "<pre>" + ts.text.replace(re, "<mark>$&</mark>", "g") + "</pre>");
		}

		for (i = ts.errors.length; i--;) {
			el.insertAdjacentHTML("beforeend", "<div class='error'>" + ts.errors[i] + "</div>");
		}
	}

	function countEntities(e) {
		e.preventDefault();
		e.stopPropagation();

		var matrices = new Matrices(e.currentTarget.elements.matrixText.value),
			el = document.getElementById("matrixResult"),
			i;

		el.innerHTML = "";
		el.insertAdjacentHTML("beforeend", "<pre>" + matrices.getResult() + "</pre>");

		for (i = matrices.errors.length; i--;) {
			el.insertAdjacentHTML("beforeend", "<div class='error'>" + matrices.errors[i] + "</div>");
		}
	}

	document.forms.searchForm.addEventListener("submit", searchText, false);
	document.forms.matrixForm.addEventListener("submit", countEntities, false);

}());

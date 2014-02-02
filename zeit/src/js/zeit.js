(function(TextSearch) {

	function searchText(e) {
		e.preventDefault();
		e.stopPropagation();

		var ts = new TextSearch(this.elements.searchText.value),
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

	document.forms.searchForm.addEventListener("submit", searchText, false);

}(TextSearch));

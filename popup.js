const inputSearch = document.getElementById('input-search');

/**
 * See shared.js, `handleSearch` is defined there
 */
inputSearch.addEventListener('keypress', e => {

	if(e.key === "Enter") {
		handleSearch(inputSearch.value)
		.then(() => {
			// Firefox does NOT automatically close the popup (like chrome)
			window.close();
		});
	}

});
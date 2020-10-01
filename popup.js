const inputSearch = document.getElementById('input-search');
const optionsLink = document.getElementById('a-goto-options');


/**
 * See shared.js, `handleSearch` is defined there
 */
inputSearch.addEventListener('keypress', e => {

	if(e.key === "Enter") {
		handleSearch(inputSearch.value)
		.then(() => {
			// Firefox does NOT automatically close the popup (unlike chrome)
			window.close();
		});
	}

});


function handleOptionsNavigation(e) {

	e.preventDefault();
	
	// Firefox does NOT automatically close the popup (unlike chrome)
	if(e.key === "Enter" || e.type === "click") {
		window.open(optionsLink.href, '_blank');
		window.close();
	}

}


optionsLink.addEventListener('click', handleOptionsNavigation);
optionsLink.addEventListener('keypress', handleOptionsNavigation);
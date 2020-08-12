// Careful when changing this, because other logic might depend on this too.
const STORAGE_DEFAULT_SEARCH_URL = 'defaultSearchURL';
const STORAGE_RULES = 'rules';
const inputSearch = document.getElementById('input-search');

/**
 * Also see the same function in popup.js
 * Code duplication mehh. Probably better to pass messages to background
 * and then respond with an formatted string?
 * 
 * @param {String} query The query with variables inside it.
 */
function handleSearch(query) {

	/* 
	* See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
	*/
	function escapeRegExp(string) {
	  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	}
  
	
	chrome.storage.sync.get([STORAGE_RULES, STORAGE_DEFAULT_SEARCH_URL], function(result) {
	  
	  // Replace expressions in the query
	  for(const RULE of result[STORAGE_RULES]) {
  
		const REGEX_SEARCH_VALUE = new RegExp(escapeRegExp(RULE.searchValue), 'g');
		query = query.replace(REGEX_SEARCH_VALUE, RULE.replaceValue);
  
	  }
  
	  // Open in a new tab
	  let newURL = result[STORAGE_DEFAULT_SEARCH_URL].replace("%s", encodeURIComponent(query));
	  chrome.tabs.create({ url: newURL });
	  
	});
  
  }
  


inputSearch.addEventListener('keypress', e => {

	if(e.key === "Enter") {
		handleSearch(inputSearch.value);
	}

});
/**
 * This file is for global (shared) variables and functions.
 * Be wary of permissions though because some API calls only work in specific layers.
 */


/**
 * ******************
 * *** Variables ****
 * ******************
 */

const STORAGE_DEFAULT_SEARCH_URL = 'defaultSearchURL';
const STORAGE_RULES = 'rules';



/**
 * ******************
 * *** Functions ****
 * ******************
 */

/**
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
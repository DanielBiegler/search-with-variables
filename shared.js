// 
// This file is for global (shared) variables and functions.
// Be wary of permissions though because some API calls only work in specific layers.
// 


// 
// ******************
// *** Variables ****
// ******************
// 

const STORAGE_DEFAULT_SEARCH_URL = 'defaultSearchURL';
const STORAGE_RULES = 'rules';



// 
// ******************
// *** Functions ****
// ******************
// 

/**
 * Replaces variables inside the query and searches in a new tab.
 * @param {String} query The query with variables inside it.
 */
function handleSearch(query) {

	/* 
	* See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
	*/
	function escapeRegExp(string) {
	  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	}
  
	
	browser.storage.sync.get([STORAGE_RULES, STORAGE_DEFAULT_SEARCH_URL]).then(
		(result) => {
	  
			// Replace expressions in the query
			for(const RULE of result[STORAGE_RULES]) {
		
				const REGEX_SEARCH_VALUE = new RegExp(escapeRegExp(RULE.searchValue), 'g');
				query = query.replace(REGEX_SEARCH_VALUE, RULE.replaceValue);
		
			}
		
			// Open in a new tab
			let newURL = result[STORAGE_DEFAULT_SEARCH_URL].replace("%s", encodeURIComponent(query));
			browser.tabs.create({ url: newURL });
		
		}
	);
  
}

/**
 * Generates and sets the default suggestion for the omnibox based on the
 * currently set search/replace values.
 */
function generateDefaultSuggestions() {

	browser.storage.sync.get([STORAGE_RULES]).then(
		(result) => {

			let suggestion = `${browser.i18n.getMessage("yourValues")}: `;

			const FIRST_RULE = result[STORAGE_RULES][0];

			if(FIRST_RULE) {

			suggestion += `${FIRST_RULE.searchValue} => ${FIRST_RULE.replaceValue}`;
			
			} else {

			suggestion = browser.i18n.getMessage("noValuesSet");
			
			}

			for(let i = 1; i < result[STORAGE_RULES].length; i++) {

			suggestion += `, ${result[STORAGE_RULES][i].searchValue} => ${result[STORAGE_RULES][i].replaceValue}`;

			}

			browser.omnibox.setDefaultSuggestion({ description: suggestion })

		}
	);

}



// TODO: Replace with SUCCESS/ERROR variants.
// TODO: Move the suggestion generation out, this function should only
// do one thing and that should be notifications!
/**
 * Handler for successfully saving a value to storage.
 * @param {boolean} isAutoClearingNotification Defaults to `true`. Whether or not to clear the notification automatically.
 * @param {number} notificationDuration Defaults to `1750ms`. Duration to display the notification for in milliseconds.
 */
function onStorageSet(isAutoClearingNotification = true, notificationDuration = 1750) {

	generateDefaultSuggestions();

	// TODO: Replace the i18n keys with SUCCESS/ERROR versions
	// Keep in mind to check whether they were used in HTML
	browser.notifications.create('storageSet',
		{
			type: 'basic',
			title:   browser.i18n.getMessage("notificationTitle"),
			message: browser.i18n.getMessage("notificationMessage"),
			iconUrl: 'icon128.png',
		}
	)
	.then(
		(notificationId) => {

			if(isAutoClearingNotification) {

				setTimeout(() => {
	
					browser.notifications.clear(notificationId);
					
				}, notificationDuration);
				
			}
			
		},
	);

}
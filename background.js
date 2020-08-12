// Const Variables
// Careful when changing this, because other files might depend on this too.
const STORAGE_RULES = 'rules';
const STORAGE_DEFAULT_SEARCH_URL = 'defaultSearchURL';


// Helpers
function generateDefaultSuggestions() {

  chrome.storage.sync.get([STORAGE_RULES], function(result) {

    let suggestion = "Your values: ";

    const FIRST_RULE = result[STORAGE_RULES][0];

    if(FIRST_RULE) {

      suggestion += `${FIRST_RULE.searchValue} => ${FIRST_RULE.replaceValue}`;
      
    } else {

      suggestion = "You have no values set. Go to the settings page to add new ones.";
      
    }

    for(let i = 1; i < result[STORAGE_RULES].length; i++) {

      suggestion += `, ${result[STORAGE_RULES][i].searchValue} => ${result[STORAGE_RULES][i].replaceValue}`;

    }

    chrome.omnibox.setDefaultSuggestion({ description: suggestion })

  });
  
}

function onStorageSet(result) {

  chrome.notifications.create('storageSet',
    {
      type: 'basic',
      title: 'Settings saved',
      message: 'Your settings have been successfully saved. Click to dismiss this notification.',
      iconUrl: 'icon128.png',
    },

    // Empty callback for backwards compatability with Chrome 42.
    // See: https://developer.chrome.com/apps/notifications#method-create
    function(notificationId) {}
  );

  generateDefaultSuggestions();
    
}


// This event is fired when the user installs/updates the extension
chrome.runtime.onInstalled.addListener((details) => {

  function onInstall() {

    const DEFAULT_CONFIG = {
      [STORAGE_RULES]: [
        { id: 0, searchValue: ":ff",   replaceValue: "firefox"              },
        { id: 1, searchValue: ":js",   replaceValue: "javascript"           },
        { id: 2, searchValue: ":ciu",  replaceValue: "caniuse"              },
        { id: 3, searchValue: ":so",   replaceValue: "stackoverflow"        },
        { id: 4, searchValue: ":cea",  replaceValue: "chrome extension api" },
        { id: 5, searchValue: ":lx",   replaceValue: "linux"                },
        { id: 6, searchValue: "@db",   replaceValue: "danielbiegler.de"     },
      ],

      [STORAGE_DEFAULT_SEARCH_URL]: "https://www.google.com/search?q=%s"
    };

    chrome.storage.sync.set(DEFAULT_CONFIG);
    
  }

  function onUpdate(currentVersion, previousVersion) {
    
    // Currently there's nothing to do here.
    // Future versions might need to use this to update the internals
    
  }
  
  const currentVersion = chrome.runtime.getManifest().version;
  const previousVersion = details.previousVersion;
  const reason = details.reason;

  switch (reason) {

    case 'install':
      onInstall();
      break;
    
    case 'update':
      onUpdate(currentVersion, previousVersion);
      break;

    //  case 'chrome_update':
    //  case 'shared_module_update':
    //  default:
    //     console.log('Other install events within the browser')
    //     break;
  }

})


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


// This event is fired when the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener( handleSearch );

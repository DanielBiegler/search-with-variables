// This event is fired when the user installs/updates the extension
browser.runtime.onInstalled.addListener(details => {

  function onInstall() {

    const DEFAULT_CONFIG = {
      [STORAGE_RULES]: [
        { id: 0, searchValue: ":ff",   replaceValue: "firefox"              },
        { id: 1, searchValue: ":js",   replaceValue: "javascript"           },
        { id: 2, searchValue: ":ciu",  replaceValue: "caniuse"              },
        { id: 3, searchValue: ":so",   replaceValue: "stackoverflow"        },
        { id: 4, searchValue: ":bea",  replaceValue: "browser extension api" },
        { id: 5, searchValue: ":lx",   replaceValue: "linux"                },
        { id: 6, searchValue: "@db",   replaceValue: "danielbiegler.de"     },
      ],

      [STORAGE_DEFAULT_SEARCH_URL]: "https://www.google.com/search?q=%s"
    };

    browser.storage.sync.set(DEFAULT_CONFIG)
    .then(generateDefaultSuggestions);
    
  }

  function onUpdate(currentVersion, previousVersion) {
    
    // Currently there's nothing to do here.
    // Future versions might need to use this to update the internals
    
  }
  
  const currentVersion = browser.runtime.getManifest().version;
  const previousVersion = details.previousVersion;
  const reason = details.reason;

  switch (reason) {

    case 'install':
      onInstall();
      break;
    
    case 'update':
      onUpdate(currentVersion, previousVersion);
      break;

  }

});


// This event is fired when the user accepts the input in the omnibox.
browser.omnibox.onInputEntered.addListener( handleSearch );

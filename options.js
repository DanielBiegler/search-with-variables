// Careful when changing this, because other files might depend on this too.
const STORAGE_DEFAULT_SEARCH_URL = 'defaultSearchURL';
const STORAGE_RULES = 'rules';
const inputDefaultSearchEngine = document.getElementById('input-default-search-engine');
const sectionVariablesContainer = document.getElementById('section-variables');
const textVariableStatus = document.getElementById('p-variables-status');


function onStorageSet() {

	chrome.notifications.create('storageSet',
		{
			type: 'basic',
			title: 'Settings saved',
			message: 'Your settings have been successfully saved. Click to dismiss this notification.',
			iconUrl: 'newtab_search128.png',
		},
	
		// Empty callback for backwards compatability with Chrome 42.
		// See: https://developer.chrome.com/apps/notifications#method-create
		function(notificationId) {}
	);

}


function initSettings() {

	chrome.storage.sync.get(function(result) {

		// Search engine query URL
		inputDefaultSearchEngine.value = result[STORAGE_DEFAULT_SEARCH_URL];
		inputDefaultSearchEngine.addEventListener("change", event => {

			chrome.storage.sync.set({ [STORAGE_DEFAULT_SEARCH_URL]: inputDefaultSearchEngine.value }, onStorageSet);

		});


		if(result[STORAGE_RULES].length === 0) {
			
			textVariableStatus.innerText = "There are currently no variables set.";
			
		} else {

			textVariableStatus.style.display = "none";

			// Variables
			for(let i = 0; i < result[STORAGE_RULES].length; i++) {

				const ruleId = result[STORAGE_RULES][i].id;
				
				// Add row for this entry
				const template = `<div class="three columns">
						<input class="u-full-width" type="text" id="input-variable-${ruleId}" placeholder="Variable name" value="${result[STORAGE_RULES][i].searchValue}">
					</div>
					<div class="six columns">
						<input class="u-full-width" type="text" id="input-replace-${ruleId}" placeholder="Replace value" value="${result[STORAGE_RULES][i].replaceValue}">
					</div>
					<div class="three columns">
						<button id="button-delete-${ruleId}" class="u-full-width">Delete</button>
				</div>`;

				const htmlEntry = document.createElement('div');
				htmlEntry.classList.add('row');
				htmlEntry.id = `row-variables-${ruleId}`;
				htmlEntry.innerHTML = template; // Careful with injection? Do we care here?

				sectionVariablesContainer.appendChild(htmlEntry);

				// Add listeners for updating the values
				const inputVariable = document.getElementById(`input-variable-${ruleId}`);
				inputVariable.addEventListener("change", event => {

					// 1. Change searchValue
					const ruleIndex = result[STORAGE_RULES].findIndex(rule => rule.id === ruleId);
					result[STORAGE_RULES][ruleIndex].searchValue = inputVariable.value;
					// 2. Sync
					chrome.storage.sync.set({ [STORAGE_RULES]: result[STORAGE_RULES] }, onStorageSet);
		
				});

				/*	These are very similar, maybe make a function for it because they'll
					also be needed for the newly created inputs.
				*/
				const inputReplace = document.getElementById(`input-replace-${ruleId}`);
				inputReplace.addEventListener("change", event => {

					// 1. Change searchValue
					const ruleIndex = result[STORAGE_RULES].findIndex(rule => rule.id === ruleId);
					result[STORAGE_RULES][ruleIndex].replaceValue = inputReplace.value;
					// 2. Sync
					chrome.storage.sync.set({ [STORAGE_RULES]: result[STORAGE_RULES] }, onStorageSet);
		
				});

				// Add listener for delete button
				const btnDelete = document.getElementById(`button-delete-${ruleId}`);
				btnDelete.addEventListener('click', function(e) {

					// Remove entry
					// We need to 'find' it because the indices will change after removing elements.
					const rmIndex = result[STORAGE_RULES].findIndex(rule => rule.id === ruleId);
					result[STORAGE_RULES].splice(rmIndex, 1);
					
					// On success, remove the entry from the DOM
					htmlEntry.remove();

					// Provide some feedback just in case
					if(result[STORAGE_RULES].length === 0) {

						textVariableStatus.innerText = "There are currently no variables set.";
						textVariableStatus.style.display = "block";
						
					}

					chrome.storage.sync.set({ [STORAGE_RULES]: result[STORAGE_RULES] }, onStorageSet);

				});
				
			}

		}

	});

}

initSettings();




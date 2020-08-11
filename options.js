// Careful when changing this, because other logic might depend on this too.
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


function onDeleteAction(ruleRow, ruleId) {

	chrome.storage.sync.get([STORAGE_RULES], function(result) {

		// Remove entry
		// We need to 'find' it because the indices will change after removing elements.
		const rmIndex = result[STORAGE_RULES].findIndex(rule => rule.id === ruleId);
		result[STORAGE_RULES].splice(rmIndex, 1);

		chrome.storage.sync.set({ [STORAGE_RULES]: result[STORAGE_RULES] }, function() {

			onStorageSet();

			// On success, remove the entry from the DOM
			ruleRow.remove();

			// Provide some feedback just in case
			if(result[STORAGE_RULES].length === 0) {

				textVariableStatus.innerText = "There are currently no variables set.";
				textVariableStatus.style.display = "block";
				
			}

		});

	});
	
}


function createRuleRow(ruleId, searchValue, replaceValue) {

	// Add row for this entry
	const template = `<div class="three columns">
		<input class="u-full-width" type="text" id="input-variable-${ruleId}" placeholder="Variable name" value="${searchValue}">
	</div>
	<div class="six columns">
		<input class="u-full-width" type="text" id="input-replace-${ruleId}" placeholder="Replace value" value="${replaceValue}">
	</div>
	<div class="three columns">
		<button id="button-delete-${ruleId}" class="u-full-width">Delete</button>
	</div>`;

	const htmlEntry = document.createElement('div');
	htmlEntry.classList.add('row');
	htmlEntry.id = `row-variables-${ruleId}`;
	htmlEntry.innerHTML = template; // Careful with injection? Do we care here?

	sectionVariablesContainer.appendChild(htmlEntry);

	return {
		ruleRow: htmlEntry,
		inputVariable: document.getElementById(`input-variable-${ruleId}`),
		inputReplace: document.getElementById(`input-replace-${ruleId}`),
		buttonDelete: document.getElementById(`button-delete-${ruleId}`),
	};
}


function addInputListeners(inputVariable, inputReplace, ruleId) {

	inputVariable.addEventListener("change", event => {

		chrome.storage.sync.get([STORAGE_RULES], result => {

			// 1. create or update searchValue
			const ruleIndex = result[STORAGE_RULES].findIndex(rule => rule.id === ruleId);
			if(ruleIndex === -1) {

				result[STORAGE_RULES].push({
					id: ruleId,
					searchValue: inputVariable.value,
					replaceValue: "",
				});
				
			} else {

				result[STORAGE_RULES][ruleIndex].searchValue = inputVariable.value;
				
			}

			// 2. Sync
			chrome.storage.sync.set({ [STORAGE_RULES]: result[STORAGE_RULES] }, onStorageSet);

		});


	});

	// Bad code duplication I know, but mehh..
	// Might work to simply set both inputs, instead of separate
	// that way we can create a function that can be run for both
	// // (NOTE: then theres no need to differentiate here:
	// // // searchValue: "",
	// // // replaceValue: inputReplace.value,)
	// but this issue so localized and """probably""" doesnt need much future change?
	// that way would TECHNICALLY be less efficient but it probably doesnt make a difference.
	inputReplace.addEventListener("change", event => {

		chrome.storage.sync.get([STORAGE_RULES], result => {

			// 1. create or update searchValue
			const ruleIndex = result[STORAGE_RULES].findIndex(rule => rule.id === ruleId);
			if(ruleIndex === -1) {

				result[STORAGE_RULES].push({
					id: ruleId,
					searchValue: "",
					replaceValue: inputReplace.value,
				});
				
			} else {

				result[STORAGE_RULES][ruleIndex].replaceValue = inputReplace.value;
				
			}

			// 2. Sync
			chrome.storage.sync.set({ [STORAGE_RULES]: result[STORAGE_RULES] }, onStorageSet);

		});


	});
	
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
				
				// Add rule row
				const {ruleRow, inputVariable, inputReplace, buttonDelete} = createRuleRow(ruleId, result[STORAGE_RULES][i].searchValue, result[STORAGE_RULES][i].replaceValue);

				// Add listeners
				addInputListeners(inputVariable, inputReplace, ruleId)

				// Add listener for delete button
				buttonDelete.addEventListener('click', (e) => {
					
					onDeleteAction(ruleRow, ruleId);

				});
				
			}

		}

	});

}

initSettings();


// Init the Add-Variable button
document.getElementById('button-add-variable').addEventListener('click', e => {

	const ruleId = Date.now();
	const {ruleRow, inputVariable, inputReplace, buttonDelete} = createRuleRow(ruleId, "", "");

	// first make function for adding listeners
	// call it here
	addInputListeners(inputVariable, inputReplace, ruleId);
	
	buttonDelete.addEventListener('click', (e) => {

		onDeleteAction(ruleRow, ruleId);

	});
	
});

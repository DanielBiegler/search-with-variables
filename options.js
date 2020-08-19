const inputDefaultSearchEngine = document.getElementById('input-default-search-engine');
const sectionVariablesContainer = document.getElementById('section-variables');
const textVariableStatus = document.getElementById('p-variables-status');



function onDeleteAction(ruleRow, ruleId) {

	browser.storage.sync.get([STORAGE_RULES])
	.then(result => {

		// Remove entry
		// We need to 'find' it because the indices will change after removing elements.
		const rmIndex = result[STORAGE_RULES].findIndex(rule => rule.id === ruleId);
		result[STORAGE_RULES].splice(rmIndex, 1);

		browser.storage.sync.set({ [STORAGE_RULES]: result[STORAGE_RULES] })
		.then(() => {

			onStorageSet();

			// On success, remove the entry from the DOM
			ruleRow.remove();

			// Provide some feedback just in case
			if(result[STORAGE_RULES].length === 0) {

				textVariableStatus.innerText = browser.i18n.getMessage("noVariables");
				textVariableStatus.style.display = "block";
				
			}

		});

	});
	
}


function createRuleRow(ruleId, searchValue, replaceValue) {

	// Add row for this entry
	const template = `<div class="three columns">
		<input class="u-full-width" type="text" id="input-variable-${ruleId}" placeholder="${browser.i18n.getMessage("variableName")}" value="${searchValue}">
	</div>
	<div class="six columns">
		<input class="u-full-width" type="text" id="input-replace-${ruleId}" placeholder="${browser.i18n.getMessage("replaceValue")}" value="${replaceValue}">
	</div>
	<div class="three columns">
		<button id="button-delete-${ruleId}" class="u-full-width">${browser.i18n.getMessage("delete")}</button>
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

	function createOrUpdateEntry(result) {

		// 1. create or update searchValue
		const ruleIndex = result[STORAGE_RULES].findIndex(rule => rule.id === ruleId);
		// -1 means findIndex couldnt find the index
		if(ruleIndex === -1) {

			result[STORAGE_RULES].push({
				id: ruleId,
				searchValue: inputVariable.value,
				replaceValue: inputReplace.value,
			});
			
		} else {

			result[STORAGE_RULES][ruleIndex].searchValue = inputVariable.value;
			result[STORAGE_RULES][ruleIndex].replaceValue = inputReplace.value;
			
		}

		// 2. Sync
		browser.storage.sync.set({ [STORAGE_RULES]: result[STORAGE_RULES] })
		.then(onStorageSet);

	}


	function handleChange(event) {
		browser.storage.sync.get([STORAGE_RULES])
		.then(createOrUpdateEntry);
	}

	
	inputVariable.addEventListener("change", handleChange);
	inputReplace.addEventListener("change", handleChange);
	
}


function initSettings() {

	// Retrieve everything
	browser.storage.sync.get()
	.then(result => {

		// Search engine query URL
		inputDefaultSearchEngine.value = result[STORAGE_DEFAULT_SEARCH_URL];
		inputDefaultSearchEngine.addEventListener("change", event => {

			browser.storage.sync.set({ [STORAGE_DEFAULT_SEARCH_URL]: inputDefaultSearchEngine.value })
			.then(onStorageSet);

		});


		if(result[STORAGE_RULES].length === 0) {
			
			textVariableStatus.innerText = browser.i18n.getMessage("noVariables");
			
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

	// Just in case
	textVariableStatus.style.display = "none";

	const ruleId = Date.now();
	const {ruleRow, inputVariable, inputReplace, buttonDelete} = createRuleRow(ruleId, "", "");

	// first make function for adding listeners
	// call it here
	addInputListeners(inputVariable, inputReplace, ruleId);
	
	buttonDelete.addEventListener('click', (e) => {

		onDeleteAction(ruleRow, ruleId);

	});
	
});

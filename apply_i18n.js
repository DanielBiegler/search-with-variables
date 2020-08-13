document.addEventListener("DOMContentLoaded",function(){

	document.querySelectorAll('[data-i18n]').forEach(el => {
	
		if(el.nodeName === "INPUT") {
	
			el.placeholder = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
			
		} else {
	
			el.innerText = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
			
		}
	
	});
	
	document.querySelectorAll('[data-i18n-html]').forEach(el => {
	
		el.innerHTML = chrome.i18n.getMessage(el.getAttribute('data-i18n-html'));
	
	});

});

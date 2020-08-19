document.addEventListener("DOMContentLoaded",function(){

	document.querySelectorAll('[data-i18n]').forEach(el => {
	
		if(el.nodeName === "INPUT") {
	
			el.placeholder = browser.i18n.getMessage(el.getAttribute('data-i18n'));
			
		} else {
	
			el.innerText = browser.i18n.getMessage(el.getAttribute('data-i18n'));
			
		}
	
	});
	
	document.querySelectorAll('[data-i18n-html]').forEach(el => {
	
		el.innerHTML = browser.i18n.getMessage(el.getAttribute('data-i18n-html'));
	
	});

});

var phantom = require('phantom');

phantom.create(function(ph) {
	return ph.createPage(function(page) {
		return page.open("http://localhost:8000", function(status) {
			if(status === 'success') {
				var pageHTML = page.evaluate(function() {
					return window.document.getElementsByTagName('html')[0].innerHTML;
				}, function(result) {
					console.log(result);
				});
			}
			else {
				console.log('Error while getting the page');
			}
		});
	});
});

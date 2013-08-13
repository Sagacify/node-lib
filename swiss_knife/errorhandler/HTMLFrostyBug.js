/**
* HTMLFrostyBug.js adds client-side error reporting features.
*/

exports.prototypes = function(w) {
	w.frostybug = {};
	w.frostybug.history = [];
	w.onerror = function(msg, url, line) {
		var error = {
			msg: msg,
			url: url,
			line: line
		}
		w.frostybug.history.push(error);
		try{
			console.error.apply(console, arguments);
		}
		catch(e) {
			console.error.apply(this, arguments);
		}
	};
})(window);
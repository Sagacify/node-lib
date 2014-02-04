/**
* TODO : escaping HTML entities
* This is Express's implementation which probably isn't safe :
*/

var Caja = require('./GoogleCaja.js');

var HTML_ENTITY_MAP = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	'\'': '&#x27;',
	'/': '&#x2F;'
};

// OSWASP Guidlines: &, <, >, ", ' plus forward slash.
var HTML_CHARACTERS_EXPRESSION = /[&"'<>\/]/gm;
function escapeHTML(text) {
	return text && text.replace(HTML_CHARACTERS_EXPRESSION, function (c) {
		return HTML_ENTITY_MAP[c] || c;
	});
}

module.exports = function sanitize_Data (str) {
	return str ? Caja.escape(str) : "";
};
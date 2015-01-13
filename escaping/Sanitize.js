var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

var Caja = require('./GoogleCaja.js');

var HTML_ENTITY_MAP = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	'\'': '&#x27;',
	'/': '&#x2F;'
};

var HTML_MAP = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#x27;': '\'',
	'&#x2F;': '/'
};

// OSWASP Guidlines: &, <, >, ", ' plus forward slash.
var HTML_CHARACTERS_EXPRESSION = /[&"'<>\/]/gm;
var HTML_ENTITIES_EXPRESSION = /&[^;]{2,5};/gm;

exports.escapeHTML = function (text) {
	return text && text.replace(HTML_CHARACTERS_EXPRESSION, function (c) {
		return HTML_ENTITY_MAP[c] || c;
	});
};

exports.decodeHTML = function (text) {
	return text && text.replace(HTML_ENTITIES_EXPRESSION, function (c) {
		return HTML_MAP[c] || c;
	});
};

exports.sanitize = function (str) {
	return str ? Caja.escape(str) : '';
};

exports.clearText = function (str) {
	var text = '';
	if(typeof str === 'string') {
		text = str;
	}

	text = entities.decode(text);

	// Remove non-extended-ASCII characters
	text = text.replace(/[^\u0000-\u00ff]/g, '');
	text = text.replace(/\s+/g, ' ');

	text = exports.escapeHTML(text);
	text = text.trim();

	return text;
};
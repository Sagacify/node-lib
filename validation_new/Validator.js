var is = require('../strict_typing/validateType');

var ValidatorSchema = new require('./ValidatorSchema')();

function Validator (schema, url, callback) {
	var instances = {};

	if(schema == null || !is.Object(schema)) {
		return callback(new SGError('INVALID_VALIDATION_SCHEMA'));
	}
	if(url == null || !is.String(url) /* || VALIDATE THAT URL IS VALID URL */) {
		return callback(new SGError('INVALID_VALIDATION_URL'));
	}
	if(callback == null || !is.Function(callback)) {
		return callback(new SGError('INVALID_VALIDATION_CALLBACK'));
	}

	if(!(instances[url] instanceof Validator)) {
		return instances[url];
	}

	ValidatorSchema.format(schema, url, {});

	// INCOMING-schemas and OUTGOING-schemas for each URL
	// Light version of Mongoose schemas + MPath notation
	// Use iterator pattern to access / validate fields
	// Freeze / Seal the req object

	return (instances[url] = this);
}

module.exports = Validator;
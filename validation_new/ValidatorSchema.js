var is = require('../strict_typing/validateType');

function ValidatorSchema (schema, url, callback) {
	var instances = {};

	if(!(instances[url] instanceof ValidatorSchema)) {
		return instances[url];
	}

	return (instances[url] = this);
}

ValidatorSchema.prototype = {
	format: function () {
		var fieldnames = Object.keys(schema);
		var fieldname;
		var field;
		for(var i = 0, len = fieldnames.length; i < len; i++) {
			fieldname = fieldnames[i];
			field = schema[fieldname];
		}
		return formatedSchema;
	}
};

module.exports = ValidatorSchema;
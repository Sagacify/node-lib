var SGStrictTyping = require('../../lib/strict_typing/SGStrictTyping');
var is = require('../strict_typing//validateType');


function generic_validator (field, conditions) {
	field.validate(function (value) {
		return SGStrictTyping.apply_to_Ele(value, conditions);
	});
}

mongoose.Schema.prototype.prepareSchemaValidation = function (model_name) {
	var paths = this.paths;
	var path_names = Object.keys(paths);
	var len = path_names.length;
	var validation_rules;
	var path;
	var i;
	while(len--) {
		i = path_names[len];
		path = paths[i];
		conditions = path.options.validation;
		if((conditions != null) && is.Array(conditions) && conditions.length) {
			console.log('-- Validation for ' + model_name + '.' + i + ' added !');
			generic_validator(this.path(i), conditions);
		}
		else if(path.schema) {
			this.prepareSchemaValidation.apply(path.schema, [model_name + '.' + i + '.$']);
		}
	}
};

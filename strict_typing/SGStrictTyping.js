var is = require('./validateType');
var isValid = require('./validateFormat');

var models = mongoose.models;
var mpath = require('mpath');

var escape_default = config.escapeDefault;
var sanitize_default = config.sanitizeDefault;

function hasUndefined (obj) {
	if(obj == null) {
		return true;
	}
	else if(is.Array(obj)) {
		return obj.reduce(function (a, b) {
			return a && (is.NotNull(b));
		}, true);
	}
	else {
		return false;
	}
}

function get_FieldValidation (field, schema) {
	var schema_field = mpath.get(field, schema);
	var validation_rules = false;
	if(!hasUndefined(schema_field) && is.Array(schema_field.validation)) {
		validation_rules = schema_field.validation;
	}
	return validation_rules;
}

var SGStrictTyping = function SGStrictTyping (strict_mode) {

	this.strict_mode = is.NotNull(strict_mode) ? strict_mode : true;

	this.base_error = 'VALIDATION_FAIL';

	this.args_buffer = null;

	this.validate_Type = function (obj, type) {
		return (type in is) && (is[type](obj));
	};

	this.validate_Format = function (obj, method_list) {
		var valid = true;
		var validation_method;
		var validation_args;
		var method;
		for(var i = 0, len = method_list.length; i < len; i++) {
			method = method_list[i];
			if(is.String(method)) {
				valid = isValid[method](obj);
			}
			else if(is.Object(method)) {
				validation_method = Object.keys(method)[0];
				validation_args = [obj].concat(method[validation_method]);
				valid = isValid[validation_method].apply(this, validation_args);
			}
			else {
				valid = false;
				break;
			}
		}
		return valid;
	};

	this.validate_Config = function (ele_config) {
		return is.NotNull(ele_config) && is.Array(ele_config) && ele_config.length;
	};

	this.hasInheritFlag = function (field, conditions)  {
		var first_condition = conditions[0];
		var inherited_validation = false;
		if(is.String(first_condition) && first_condition.startsWith('inherits:')) {
			var modelname = first_condition.split(':')[1];
			if(modelname in models) {
				var schema_tree = models[modelname].schema.tree;
				inherited_validation = get_FieldValidation(field, schema_tree);
			}
		}
		return inherited_validation;
	};

	this.hasOptionalFlag = function (conditions) {
		var first_condition = conditions[0];
		return (first_condition === 'isOptional');
	};

	this.apply_to_Ele = function (ele, key, ele_config) {
		var isOptional = false;
		if(ele_config.length) {
			var inheritedValidation = this.hasInheritFlag(key, ele_config);
			ele_config = inheritedValidation || ele_config;
		}
		if(ele_config.length) {
			isOptional = this.hasOptionalFlag(ele_config);
			ele_config = ele_config.splice(isOptional, ele_config.length);
		}
		if(isOptional && (ele == null)) {
			return true;
		}
		else if(ele_config.length && (ele != null)) {
			var expected_Type = ele_config[0];
			var expected_methods = ele_config.splice(1);
			if(is.String(expected_Type) && is.Array(expected_methods)) {
				var has_ValidType = this.validate_Type(ele, expected_Type);
				var has_ValidFormat = this.validate_Format(ele, expected_methods);
				return has_ValidType && has_ValidFormat;
			}
		}
		else {
			return false;
		}
	};

	this.import_from_Scope = function (scope) {
		var scope_validation = {};
		if((scope in models)) {
			var schema = models[scope].schema;
			var scope_fields = schema.developOptions();
			var schema_tree = schema.tree;
			var i = scope_fields.length;
			var field_validation;
			var field;
			while(i--) {
				field = scope_fields[i];
				field_validation = get_FieldValidation(field, schema_tree);
				if(field_validation !== false) {
					scope_validation[field] = field_validation;
				}
			}
		}
		return scope_validation;
	};

	this.apply_to_Args = function (args, args_config, callback) {
		this.args_buffer = {};
		if(is.Object(args) && is.Object(args_config)) {
			if(('_scope' in args_config) && (args_config._scope != null)) {
				var scope_validation = this.import_from_Scope(args_config._scope);
				args_config = scope_validation.merge(args_config);
				delete args_config._scope;
			}
			var keys = Object.keys(args_config);
			var len = keys.length;
			var ele_config;
			var ele;
			var i;
			while(len--) {
				i = keys[len];
				ele = args[i];
				console.log('\n --> ' + i);
				//ele_config = args_config[i];
				ele_config = args_config[i].clone();
				if(this.validate_Config(ele_config)) {
					if(this.apply_to_Ele(ele, i, ele_config)) {
						console.log(' --> [X] OK');
						if(this.strict_mode) {
							this.args_buffer[i] = ele;
						}
					}
					else {
						return callback(this.base_error + '_INVALID_VALUE');
					}
				}
				else {
					return callback(this.base_error + '_INVALID_CONFIG');
				}
			}
			var array_ags = Array.apply(null, arguments);
			var new_args = this.strict_mode ? this.args_buffer : array_ags;
			return callback.apply(this, [null].concat(new_args));
		}
		else {
			return callback(this.base_error + '_INVALID_ARGS');
		}
	};

};

SGStrictTyping.prototype = {
	args_buffer		:	{}
};

module.exports = SGStrictTyping;
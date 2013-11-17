var is = require('./validateType');
var isValid = require('./validateFormat');

var models = mongoose.models;

var escape_default = config.escapeDefault;
var sanitize_default = config.sanitizeDefault;

function get_FieldValidation (field, schema) {
	var schema_field = schema.path(field);
	var validation_rules = false;
	if((schema_field != null) && is.Array(schema_field.options.validation)) {
		validation_rules = schema_field.options.validation;
	}
	return validation_rules;
}

var SGStrictTyping = function SGStrictTyping (strict_mode) {

	this.strict_mode = is.NotNull(strict_mode) ? strict_mode : true;

	this.base_error = 'VALIDATION_FAIL';

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
		return is.NotNull(ele_config) && is.Array(ele_config) /*&& ele_config.length*/;
	};

	this.hasInheritFlag = function (field, conditions)  {
		var first_condition = conditions[0];
		var inherited_validation = false;
		if(is.String(first_condition) && first_condition.startsWith('inherits:')) {
			var modelname = first_condition.split(':')[1];
			if(modelname in models) {
				var schema = models[modelname].schema;
				inherited_validation = get_FieldValidation(field, schema);
			}
		}
		return inherited_validation;
	};

	this.hasOptionalFlag = function (conditions) {
		var first_condition = conditions[0];
		return (first_condition === 'isOptional');
	};

	this.develop_ValidationConfig = function (args_config) {
		//args_config.validation
		if(is.Object(args_config)) {
			var scope = args_config._scope;
			if((scope != null) && is.String(scope)) {
				var scope_validation = this.import_from_Scope(scope);
				args_config = scope_validation.merge(args_config);
				delete args_config._scope;
			}
			var field_names = Object.keys(args_config);
			var len = field_names.length;
			var inheritedValidation;
			var ele_config;
			var i;
			while(len--) {
				i = field_names[len];
				ele_config = args_config[i];
				if(ele_config.length) {
					inheritedValidation = this.hasInheritFlag(i, ele_config);
					ele_config = inheritedValidation || ele_config;
				}
				args_config[i] = ele_config;
			}
		}
		return args_config || {};
	};

	this.import_from_Scope = function (scope) {
		var scope_validation = {};
		if((scope in models)) {
			var schema = models[scope].schema;
			var scope_fields = schema.developOptions().fields;
			var i = scope_fields.length;
			var field_validation;
			var field;
			while(i--) {
				field = scope_fields[i];
				field_validation = get_FieldValidation(field, schema);
				if(field_validation !== false) {
					scope_validation[field] = field_validation;
				}
			}
		}
		return scope_validation;
	};

	this.setCustom = function (obj) {
		const __TRUE__ = true;
		Object.defineProperty(obj, 'custom', {
			configurable: true,
			get: function () {
				return __TRUE__ && (delete this.custom);
			}
		});
	};

	this.assemble_Object = function (obj, key, value) {
		var parts = key.split('.');
		var p = parts.pop();
		for(var i = 0, j; obj && (j = parts[i]); i++) {
			obj = (j in obj ? obj[j] : obj[j] = {});
		}
		return obj && p ? (obj[p] = value) : undefined;
	};

	this.disassemble_Object = function (obj, key) {
		var me = this;
		function arrIndex (arr, i) {
			var keyArr = arr.reduce(function (a, b) {
				return (i in b) && (b[i] != null) ? a.concat([b[i]]) : a;
			}, []);
			me.setCustom(keyArr);
			return keyArr;
		}
		function index(obj, i) {
			return is.Array(obj) ? arrIndex(obj, i) : obj[i];
		}
		return key.split('.').reduce(index, obj);
	};

	this.apply_to_Ele = function (ele, ele_config) {
		var isOptional = false;
		if(ele_config.length) {
			isOptional = this.hasOptionalFlag(ele_config);
			ele_config = ele_config.clone().splice(isOptional, ele_config.length);
		}
		if(isOptional && (ele == null)) {
			return true;
		}
		else if(ele_config.length && (ele != null)) {
			var expected_Type = ele_config[0];
			if((expected_Type === 'Date') && is.DateString(ele)) {
				ele = new Date(ele);
			}
			var expected_methods = ele_config.splice(1);
			if(is.String(expected_Type) && is.Array(expected_methods)) {
				var has_ValidType = this.validate_Type(ele, expected_Type);
				var has_ValidFormat = this.validate_Format(ele, expected_methods);
				return !!(has_ValidType && has_ValidFormat);
			}
		}
		else {
			return false;
		}
	};

	this.apply_to_Array = function (ele_list, key, ele_config) {
		if(!is.Array(ele_list) || (ele_list.custom !== true)) {
			return this.apply_to_Ele(ele_list, ele_config);
		}
		else {
			var i = ele_list.length;
			var isValid = true;
			while(i--) {
				isValid = isValid && this.apply_to_Ele(ele_list[i], ele_config);
			}
			return isValid;
		}
	};

	this.apply_to_Args = function (args, args_config, callback) {
		args_config = this.develop_ValidationConfig(args_config);
		var args_buffer = {};
		console.log(args);
		console.log(args_config);
		if(is.Object(args) && is.Object(args_config)) {
			var keys = Object.keys(args_config);
			var len = keys.length;
			var ele_config;
			var ele;
			var i;
			while(len--) {
				i = keys[len];
				ele = (args[i] != null) ? args[i] : this.disassemble_Object(args, i);
				ele_config = args_config[i];
				//ele_config = args_config[i].clone();
				console.log('\n --> ' + i);
				console.log(ele);
				if(this.validate_Config(ele_config)) {
					if(this.apply_to_Array(ele, i, ele_config)) {
					//if(this.apply_to_Ele(ele, ele_config)) {
						console.log(' --> [X] OK');
						if(this.strict_mode) {
							this.assemble_Object(args_buffer, i, is.DateString(ele) ? new Date(ele) : ele);
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
			var new_args = this.strict_mode ? args_buffer : array_ags;
			return callback.apply(this, [null].concat(new_args));
		}
		else {
			return callback(this.base_error + '_INVALID_ARGS');
		}
	};

};

var mySGStrictTyping = new SGStrictTyping(true);

module.exports = mySGStrictTyping;
var is = require('./validateType');
var isValid = require('./validateFormat');

var SGStrictTyping = function SGStrictTyping (strict_mode) {

	this.strict_mode = is.NotNull(strict_mode) ? strict_mode : true;

	this.base_error = 'VALIDATION_FAIL';

	this.args_buffer = null;

	this.validate_Type = function (obj, type) {
		return (type in is) && (is[type](obj));
	};

	this.validate_Format = function (obj, method_list) {
		for(var i = 0, len = method_list.length; i < len; i++) {
			method = method_list[i];
			if(!isValid[method](obj)) {
				return false;
			}
		}
	};

	this.validate_Config = function (ele_config) {
		return is.NotNull(ele_config) && is.Array(ele_config);
	};

	this.apply_to_Ele = function (ele, key, ele_config) {
		var expected_Type = args_config[0];
		var expected_methods = args_config.splice(1);
		if(is.String(expected_Type) && is.String(expected_methods)) {
			var has_ValidType = this.validate_Type(ele, expected_Type);
			var has_ValidFormat = this.validate_Format(ele, expected_methods);
			return has_ValidType && has_ValidFormat;
		}
		else {
			return false;
		}
	};

	this.apply_to_Args = function (args, args_config, callback) {
		if(is.Object(args) && is.Object(args_config)) {
			var keys = Object.keys(args);
			var len = keys.length;
			var ele_config;
			var ele;
			var i;
			while(len--) {
				i = keys[len];
				ele = args[i];
				ele_config = args_config[i];
				if(is.Array(ele_config) && (ele_config.length > 1) && is.NotNull(ele)) {
					if(this.apply_to_Ele(ele, i, ele_config)) {
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
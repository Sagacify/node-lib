var Mixin = function Mixin (input) {
	this.input = input;
	this.error = null;
	this.mixin = {};
	this.input_NotEmpty = function () {
		if(!this.input || !this.input.isObject() || !Object.keys(this.input).length) {
			this.error = 'EMPTY_INPUT';
		}
		return this;
	};
	this.expecting = function (property, type, len) {
		if(!this.error) {
			var value = this.input[property];
			if(!((value != null) && (value.getType() === '[object ' + type + ']'))) {
				this.error = 'INVALID_TYPE_FOR_' + property;
			}
			else if(len && (value.length !== len)) {
				this.error = 'INVALID_LENGTH';
			}
			else {
				this.mixin[property] = value;
			}
		}
		return this;
	};
};

Mixin.prototype = {
	Register: function (callback) {
		this
		.input_NotEmpty()
		.expecting('unique', 'Array', 2)
		.expecting('email', 'String')
		.expecting('password', 'String')
		.expecting('user_attr', 'Object')
		.expecting('typeof_email', 'String')
		.expecting('is_registering', 'Boolean')
		.expecting('required_state', 'Boolean');
		callback(this.error, this.mixin);
	},
	Login: function (callback) {
		this
		.input_NotEmpty()
		.expecting('unique', 'Array', 2)
		.expecting('password', 'String')
		.expecting('required_state', 'Boolean');
		callback(this.error, this.mixin);
	},
	TokenStrategy: function (callback) {
		this
		.input_NotEmpty()
		.expecting('unique', 'Array', 1)
		.expecting('authorization', 'String')
		.expecting('required_state', 'Boolean');
		callback(this.error, this.mixin);
	},
	Logout: function (callback) {
		this
		.input_NotEmpty()
		.expecting('user', 'Object');
		callback(this.error, this.mixin);
	},
	ChangePassword: function (callback) {
		this
		.input_NotEmpty()
		.expecting('user', 'Object')
		.expecting('password', 'String')
		.expecting('new_password', 'String');
		callback(this.error, this.mixin);
	},
	VerifyEmail: function (callback) {
		this
		.input_NotEmpty()
		.expecting('unique', 'Array', 2)
		.expecting('password', 'String')
		.expecting('token', 'String')
		.expecting('required_state', 'Boolean');
		callback(this.error, this.mixin);
	},
	ForgotPassword: function (callback) {
		this
		.input_NotEmpty()
		.expecting('unique', 'Array', 2)
		.expecting('email', 'String')
		.expecting('required_state', 'Boolean');
		callback(this.error, this.mixin);
	}
};

module.exports = function (event_name, input, typeof_email, state, is_registering) {
	input.required_state = state;
	input.typeof_email = typeof_email;
	input.is_registering = is_registering || false;
	return function (callback) {
		new Mixin(input)[event_name](callback);
	};
};

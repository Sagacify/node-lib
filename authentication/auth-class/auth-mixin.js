var Mixin = function Mixin (input) {
	this.input = input;
	this.error = null;
	this.mixin = {};
	this.input_NotEmpty = function () {
		if(!this.input || !Object.isObject(input) || !Object.keys(input).length) {
			this.error = 'EMPTY_INPUT';
		}
		return this;
	};
	this.expecting = function (property, type, len) {
		if(!this.error) {
			var value = this.input[property];
			if(!((value != null) && (typeof value == type))) {
				this.error = 'INVALID_TYPE';
			}
			else if(len && (value.length === len)) {
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
		.expecting('user_attr', 'String')
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
		.expecting('authorization', 'Object')
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

module.exports = function (event_name, input, state, typeof_email) {
	input.required_state = state;
	input.typeof_email = typeof_email;
	return new Mixin(input)[event_name];
};

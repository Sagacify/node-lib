var async = require('async');
var waterfall = async.waterfall;

var init_Mixin = require('./auth-mixin');

var logic = require('../auth-logic/logic-lib');
var add_Token				=	logic.add_Token,
	find_User				=	logic.find_User,
	save_User				=	logic.save_User,
	send_Email				=	logic.send_Email,
	hash_Token				=	logic.hash_Token,
	flip_State				=	logic.flip_State,
	create_User				=	logic.create_User,
	create_Token			=	logic.create_Token,
	remove_Token			=	logic.remove_Token,
	replace_Token			=	logic.replace_Token,
	compare_Token			=	logic.compare_Token,
	hash_Password			=	logic.hash_Password,
	validate_State			=	logic.validate_State,
	validate_Token			=	logic.validate_Token,
	compare_Password		=	logic.compare_Password,
	remove_Duplicates		=	logic.remove_Duplicates,
	remove_ExcessTokens		=	logic.remove_ExcessTokens,
	remove_ExpiredTokens	=	logic.remove_ExpiredTokens;

var Auth_LogicController = {
	Register: function (input, callback) {
		waterfall([
			init_Mixin('Register', input, 'verification_email', unvalidated, true),
			find_User,
			remove_Duplicates,
			create_User,
			create_Token,
			hash_Token,
			add_Token,
			hash_Password,
			save_User,
			send_Email
		], callback);
	},
	Login: function (input, callback) {
		waterfall([
			init_Mixin('Login', input, null, validated),
			find_User,
			validate_State,
			compare_Password,
			create_Token,
			hash_Token,
			add_Token,
			remove_ExpiredTokens,
			remove_ExcessTokens,
			save_User
		], callback);
	},
	TokenStrategy: function (input, callback) {
		waterfall([
			init_Mixin('TokenStrategy', input, null, validated),
			validate_Token,
			find_User,
			validate_State,
			hash_Token,
			compare_Token // regenerate a token if it expired ?
		], callback);
	},
	Logout: function (input, callback) {
		waterfall([
			init_Mixin('Logout', input, null, null),
			compare_Token,
			remove_Token,
			save_User
		], callback);
	},
	ChangePassword: function (input, callback) {
		waterfall([
			init_Mixin('ChangePassword', input, null, null),
			compare_Password,
			hash_Password,
			create_Token,
			hash_Token,
			save_User
		], callback);
	},
	VerifyEmail: function (input, callback) {
		waterfall([
			init_Mixin('VerifyEmail', input, null, unvalidated),
			find_User,
			validate_State,
			hash_Token,
			compare_Token,
			compare_Password,
			create_Token,
			hash_Token,
			replace_Token,
			flip_State,
			save_User,
		], callback);
	},
	ForgotPassword: function (input, callback) {
		waterfall([
			init_Mixin('ForgotPassword', input, 'password_reset_email', validated),
			find_User,
			validate_State,
			create_Token,
			hash_Token,
			replace_Token,
			flip_State,
			save_User,
			send_Email
		], callback);
	},
	ResetPassword: function (input, callback) {
		waterfall([
			init_Mixin('ResetPassword', input, null, unvalidated),
			find_User,
			validate_State,
			hash_Token,
			compare_Token,
			hash_Password,
			create_Token,
			hash_Token,
			replace_Token,
			flip_State,
			save_User
		], callback);
	}
};

module.exports = Auth_LogicController;

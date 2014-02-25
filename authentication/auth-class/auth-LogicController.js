var async = require('async');
var waterfall = async.waterfall;

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

// stupid echo function used to keep arguments in scope with closures
function echo_mixin (input) {
	return function (callback) {
		callback(null, input);
	};
}

var Auth_LogicController = {
	Register: [
		// @params
		{
			search			:	['Array', { lenEqualTo: [2] }],
			email			:	['String', 'notNull', 'notEmpty','isEmail'],
			password		:	['String', 'notNull', 'notEmpty'],
			user_attr		:	['Object'],
			expectedState	:	['Number'],
			resultingState	:	['Number'],
			action			:	['String', 'notNull', 'notEmpty'],
			req				:	['isOptional', 'Object']
		},
		// the method itself
		function (input, callback) {
			waterfall([
				echo_mixin(input),
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
		// @returns
		{}
	],
	Login: [
		// @params
		{
			search			:	['Array', { lenEqualTo: [2] }],
			password		:	['String', 'notNull', 'notEmpty'],
			expectedState	:	['Number'],
			resultingState	:	['Number'],
			action			:	['String', 'notNull', 'notEmpty']
		},
		// the method itself
		function (input, callback) {
			waterfall([
				echo_mixin(input),
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
		// @returns
		{}
	],
	TokenStrategy: [
		// @params
		{
			search			:	['Array', { lenEqualTo: [1] }],
			authorization	:	['String', 'notNull', 'notEmpty'],
			expectedState	:	['Number'],
			resultingState	:	['Number'],
			action			:	['String', 'notNull', 'notEmpty']
		},
		// the method itself
		function (input, callback) {
			waterfall([
				echo_mixin(input),
				validate_Token,
				find_User,
				validate_State,
				hash_Token,
				compare_Token // regenerate a token if it expired ?
			], callback);
		},
		// @returns
		{}
	],
	Logout: [
		// @params
		{
			user			:	['Object'],
			expectedState	:	['Number'],
			resultingState	:	['Number'],
			action			:	['String', 'notNull', 'notEmpty']
		},
		// the method itself
		function (input, callback) {
			waterfall([
				echo_mixin(input),
				remove_Token, // only a splice for now, should be changed in the future !
				save_User
			], callback);
		},
		// @returns
		{}
	],
	ChangePassword: [
		// @params
		{
			user			:	['Object'],
			password		:	['String'],
			new_password	:	['String'],
			expectedState	:	['Number'],
			resultingState	:	['Number'],
			action			:	['String', 'notNull', 'notEmpty']
		},
		// the method itself
		function (input, callback) {
			waterfall([
				echo_mixin(input),
				compare_Password,
				hash_Password,
				create_Token,
				hash_Token,
				add_Token,
				remove_ExpiredTokens,
				remove_ExcessTokens,
				save_User
			], callback);
		},
		// @returns
		{}
	],
	VerifyEmail: [
		// @params
		{
			search			:	['Array', { lenEqualTo: [2] }],
			password		:	['String'],
			token			:	['String'],
			expectedState	:	['Number'],
			resultingState	:	['Number'],
			action			:	['String', 'notNull', 'notEmpty']
		},
		// the method itself
		function (input, callback) {
			waterfall([
				echo_mixin(input),
				find_User,
				validate_State,
				hash_Token,
				compare_Token,
				compare_Password,
				create_Token,
				hash_Token,
				replace_Token,
				flip_State,
				save_User
			], callback);
		},
		// @returns
		{}
	],
	ForgotPassword: [
		// @params
		{
			search			:	['Array', { lenEqualTo: [2] }],
			email			:	['String', 'notNull', 'notEmpty','isEmail'],
			expectedState	:	['Array'],
			resultingState	:	['Number'],
			action			:	['String', 'notNull', 'notEmpty']
		},
		// the method itself
		function (input, callback) {
			waterfall([
				echo_mixin(input),
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
		// @returns
		{}
	],
	ResetPassword: [
		// @params
		{
			search			:	['Array', { lenEqualTo: [2] }],
			password		:	['String'],
			token			:	['String'],
			expectedState	:	['Number'],
			resultingState	:	['Number'],
			action			:	['String', 'notNull', 'notEmpty']
		},
		// the method itself
		function (input, callback) {
			waterfall([
				echo_mixin(input),
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
		},
		// @returns
		{}
	],
	RegisterFakeUser: [
		// @params
		{
			search			:	['Array', { lenEqualTo: [2] }],
			user_attr		:	['Object'],
			fakeUserProp	:	['String', 'notNull', 'notEmpty'],
			expectedState	:	['Number'],
			resultingState	:	['Number'],
			action			:	['String', 'notNull', 'notEmpty'],
			req				:	['isOptional', 'Object'],
			invite			:	['isOptional', 'Boolean']
		},
		// the method itself
		function (input, callback) {
			console.log('\n> RegisterFakeUser : <');
			console.log(input.email);
			var pipeline = [
				echo_mixin(input)
			];
			console.log('\n> INPUT :');
			console.log(input.user_attr);
			if(input.user_attr.email) {
				console.log('\n>> PASS 1');
				pipeline = pipeline.concat([
					find_User,
					create_User
				]);
				if(input.invite) {
					console.log('\n>> PASS 2');
					pipeline = pipeline.concat([
						create_Token,
						hash_Token,
						add_Token,
						//build_Url,
						//send_Email
					]);
				}
			}
			pipeline.push(save_User);
			waterfall(pipeline, callback);
		},
		// @returns
		{}
	],
	ReverseRegister: [
		// @params
		{
			search			:	['Array', { lenEqualTo: [2] }],
			token			:	['String'],
			expectedState	:	['Number'],
			resultingState	:	['Number'],
			action			:	['String', 'notNull', 'notEmpty']
		},
		// the method itself
		function (input, callback) {
			waterfall([
				echo_mixin(input),
				find_User,
				validate_State,
				hash_Token,
				compare_Token
			], callback);
		},
		// @returns
		{}
	],
	ReverseValidation: [
		// @params
		{
			search			:	['Array', { lenEqualTo: [2] }],
			password		:	['String'],
			token			:	['String'],
			user_attr		:	['Object'],
			fakeUserId		:	['String', 'notNull', 'notEmpty'],
			expectedState	:	['Number'],
			resultingState	:	['Number'],
			req				:	['isOptional', 'Object'],
			action			:	['String', 'notNull', 'notEmpty']
		},
		// the method itself
		function (input, callback) {
			waterfall([
				echo_mixin(input),
				find_User,
				remove_Duplicates,
				hash_Token,
				compare_Token,
				remove_Duplicates,
				create_User,
				hash_Password,
				create_Token,
				hash_Token,
				add_Token,
				save_User
			], callback);
		},
		// @returns
		{}
	],
};

module.exports = Auth_LogicController;

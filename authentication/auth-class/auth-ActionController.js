var SGStrictTyping = require('../../strict_typing/SGStrictTyping');
var strict_typing = new SGStrictTyping(false);

var Auth_LogicController = require('./auth-LogicController');
var Auth_StateController = require('./auth-StateController');
var Auth_TransitionController = require('./auth-TransitionController');

var Auth_ActionController = function Auth_ActionController () {

	this.gen_ExpectedState = function (action) {
		return Auth_StateController[action];
	};

	this.gen_ResultingState = function (expectedState, action) {
		return expectedState + Auth_TransitionController[action];
	};

	this.logic = Auth_LogicController;

	this.process = function (action, args, at_params, at_return, callback) {
		this.logics[action](function (at_params, at_return, auth_method) {
			SGStrictTyping(args, at_params, function (error, validated_args) {
				if(error) {
					callback(error);
				}
				else {
					this.logics[action](auth_method, callback);
				}
			});
		});
	};

};

module.exports = Auth_ActionController;
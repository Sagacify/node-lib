var SGStrictTyping = require('../../strict_typing/SGStrictTyping');

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

	this.logics = Auth_LogicController;

	var me = this;

	this.process = function (action, args, callback) {
		var expectedState = me.gen_ExpectedState(action);
		args.action = action;
		args.expectedState = expectedState;
		args.resultingState = me.gen_ResultingState(expectedState, action);
		var auth_process = me.logics[action];
		var at_params = auth_process[0];
		var auth_method = auth_process[1];
		var at_return = auth_process[2];
		SGStrictTyping.apply_to_Args(args, at_params, function (error, validated_args) {
			if(error) {
				callback(error);
			}
			else {
				auth_method(validated_args, callback);
			}
		});
	};

};

var myActionController = new Auth_ActionController();

module.exports = myActionController;
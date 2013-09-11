var LogicLib = require('../../authentication/logic/Authenticate_Token-logic');
var Handle = require('../../responses/HttpResponseHandlers.js');

var validatorInstance = require('../../validation/Validator.js');
var check = validatorInstance.check;

exports.process = function (req, res, next) {
	console.log('BEARER AUTH');

	var authorization = req.get('Authorization');
	if((authorization == null) || !authorization.length) {
		Handle.noToken(res);
	}
	else if(!authorization.indexOf('bearer ')) {
		var stripStrategy = authorization.remove(/bearer /g);
		var bearerElements = stripStrategy.split('|');
		if(bearerElements.length === 2) {
			var userid = bearerElements[0];
			var token = bearerElements[1];
			if(check(userid).mongo_ObjectId(16, true) && check(token).isSha2_Hash(16, true)) {
				var object = {
					userid: userid,
					token: bearerElements
				};
				LogicLib.process(object, 'username', config.state.validated, function (error, token, user) {
					if(error) {
						ResHandler.authFail(res);
					}
					else {
						user.token = token;
						req.user = user;
						next();
					}
				});
			}
			else {
				Handle.invalidBearer(res);
			}
		}
		else {
			Handle.invalidBearer(res);
		}
	}
	else {
		Handle.invalidBearer(res);
	}

};

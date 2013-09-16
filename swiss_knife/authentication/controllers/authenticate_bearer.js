var Hash = require('../tools/Hash');
var hashToken = Hash.hashToken;

var UserModel = model('User');

var validatorInstance = require('../../validation/Validator.js');
var check = validatorInstance.check;

exports.process = function (req, res, next) {

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
				var hashedToken = hashToken(token);
				UserModel.find({
					_id					: userid,
					state				: config.state.validated,
					'tokens.token'		: hashedToken,
					'tokens.expiration'	: Date.now()
				}, function (error, user) {
					if(error) {
						callback({ msg: 'ERROR_WHILE_SEARCHING_DB', error: error });
					}
					else if(user) {
						callback(null, token, user);
					}
					else {
						callback({ msg: 'NO_USER_WITH_THIS_ATTR_VALUE', error: null });
					}
				});
			}
			else {
				callback({ msg: 'NO_USER_WITH_THIS_ATTR_VALUE', error: null });
			}
		}
		else {
			callback({ msg: 'NO_USER_WITH_THIS_ATTR_VALUE', error: null });
		}
	}
	else {
		callback({ msg: 'NO_USER_WITH_THIS_ATTR_VALUE', error: null });
	}

};

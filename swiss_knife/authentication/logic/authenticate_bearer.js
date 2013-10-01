var Verbose = require('../../../../config/verbose_errors.json');

var Hash = require('../../hashing/Hash');
var hashToken = Hash.hashToken;

var UserModel = model('User');

var validatorInstance = require('../../validation/Validator.js');
var check = validatorInstance.check;

exports.process = function (req, res, next) {

	var authorization = req.get('Authorization');
	if((authorization == null) || !authorization.length) {
		res.send({ msg: Verbose['NO_USER_WITH_THIS_ATTR_VALUE'] });
	}
	else if(!authorization.indexOf('bearer ')) {
		var stripStrategy = authorization.remove(/bearer /g);
		var bearerElements = stripStrategy.split('|');
		if(bearerElements.length === 2) {
			var userid = bearerElements[0];
			var token = bearerElements[1];
			if(check(userid).mongo_ObjectId_hexWeb() && check(token).isSha2_Hash_hexWeb()) {
				var hashedToken = hashToken(token);
				UserModel.find({
					_id					: userid,
					state				: config.state.validated,
					'tokens.token'		: hashedToken,
					'tokens.expiration'	: { $lt: Date.now() }
				}, function (e, user) {
					if(e) {
						res.send({ msg: Verbose['ERROR_WHILE_SEARCHING_DB'] });
					}
					else if(user) {
						req.user = user;
						next();
					}
					else {
						res.send({ msg: Verbose['NO_USER_WITH_THIS_ATTR_VALUE'] });
					}
				});
			}
			else {
				res.send({ msg: Verbose['NO_USER_WITH_THIS_ATTR_VALUE'] });
			}
		}
		else {
			res.send({ msg: Verbose['NO_USER_WITH_THIS_ATTR_VALUE'] });
		}
	}
	else {
		res.send({ msg: Verbose['NO_USER_WITH_THIS_ATTR_VALUE'] });
	}

};

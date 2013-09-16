var Hash = require('../tools/Hash');
var UserModel = model('User');

exports.process = function (userid, password, token, state, callback) {

	var hashedToken = Hash.hashToken(token);
	UserModel.find({
		_id					: userid,
		state				: state,
		'tokens.token'		: hashedToken,
		'tokens.expiration'	: { $lt: Date.now() }
	}, function (e, user) {
		if(e) {
			callback({ msg: 'ERROR_WHILE_SEARCHING_DB', e: error });
		}
		else if(user) {
			Hash.compareHash(password, user.password, function (e, match) {
				if(e) {
					callback({ msg: e.msg, error: e.error });
				}
				else if(!match) {
					callback({ msg: 'INVALID_ATTR_COMBINATION', error: null });
				}
				else {
					Hash.generateToken(function (e, token) {
						if(e) {
							callback({ msg: e.msg, error: e.error });
						}
						else {
							var tokenHash = Hash.hashToken(token);
							user.tokens = [{
								token		: tokenHash,
								expiration	: Date.now() + config.expiration
							}];
							user.state = !state;
							user.save(function (e, user) {
								if(e) {
									callback({ msg: 'COULDNT_SAVE_USER_MODIFICATIONS', error: e });
								}
								else {
									callback(null, token, user);
								}
							});
						}
					});
				}
			});
		}
		else {
			callback({ msg: 'NO_USER_WITH_THIS_ATTR_VALUE', error: null });
		}
	});

};

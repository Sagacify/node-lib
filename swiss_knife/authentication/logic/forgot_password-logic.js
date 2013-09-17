var Hash = require('../tools/Hash');
var UserModel = model('User');

exports.process = function (userid, state, callback) {

	UserModel.find({
		_id		: userid,
		state	: state
	}, function (e, user) {
		if(e) {
			callback({ msg: 'ERROR_WHILE_SEARCHING_DB', error: e });
		}
		else if(user) {
			Hash.generateToken(function (err, token) {
				if(err) {
					callback({ msg: err.msg, error: err.e });
				}
				else {
					var tokenHash = Hash.hashToken(token);
					user.tokens = [{
						token		: tokenHash,
						expiration	: Date.now() + config.expiration
					}];
					user.state = !state;
					user.save(function (er, user) {
						if(er) {
							callback({ msg: 'COULDNT_SAVE_USER_MODIFICATIONS', error: er });
						}
						else {
							user.token = token;
							callback(null, token, user);
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
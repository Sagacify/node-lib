var Hash = require('../tools/Hash');
var hashToken = Hash.hashToken;

var UserModel = model('User');

exports.process = function (userid, token, state, callback) {

	var hashedToken = hashToken(token);
	UserModel.update({
		_id					: userid,
		state				: state,
		'tokens.token'		: hashedToken,
		'tokens.expiration'	: { $lt: Date.now() }
	}, {
		$unset				: { 'tokens.$' : null }
	}, function (e, user) {
		if(e) {
			callback({ msg: 'COULDNT_SAVE_USER_MODIFICATIONS', error: e });
		}
		else if(user) {
			callback(null);
		}
		else {
			callback({ msg: 'NO_USER_WITH_THIS_ATTR_VALUE', error: null });
		}
	});

};

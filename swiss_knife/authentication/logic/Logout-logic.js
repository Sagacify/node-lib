var Hash = require('../tools/Hash');
var hashToken = Hash.hashToken;

var UserModel = model('User');

exports.process = function (userid, token, state, callback) {

	UserModel.find({
		_id		: userid,
		state	: state
	}, function (e, user) {
		if(e) {
			callback({ msg: 'ERROR_WHILE_SEARCHING_DB', error: e });
		}
		else if(user) {
			var hashedToken = hashToken(token);
			var tokens = user.tokens;
			var i = tokens.length;
			var matchIndex = -1;
			while(i--) {
				if(tokens[i].token === hashedToken) {
					matchIndex = i;
					break;
				}
			}
			if((matchIndex === -1) || (tokens[matchIndex].expiration < Date.now())) {
				callback({ msg: 'INVALID_ATTR_COMBINATION', error: null });
			}
			else {
				//user.tokens = [];
				user.tokens.splice(matchIndex, 1);
				user.save(function (e) {
					if(e) {
						callback({ msg: 'COULDNT_SAVE_USER_MODIFICATIONS', error: e });
					}
					else {
						callback(null);
					}
				});
			}
		}
		else {
			callback({ msg: 'NO_USER_WITH_THIS_ATTR_VALUE', error: null });
		}
	});

};

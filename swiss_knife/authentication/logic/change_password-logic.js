var Hash = require('../../hashing/Hash');
var compareHash = Hash.compareHash;
var hashToken = Hash.hashToken;
var hashPassword = Hash.hashPassword;
var generateToken = Hash.generateToken;

var UserModel = model('User');

exports.process = function (userid, password, new_password, state, callback) {

	UserModel.find({
		_id		: userid,
		state	: state
	}, function (e, user) {
		if(e) {
			callback({ msg: 'ERROR_WHILE_SEARCHING_DB', error: e });
		}
		else if(user) {
			compareHash(password, user.password, function (e, match) {
				if(e) {
					callback({ msg: e.msg, error: e.error });
				}
				else if(!match) {
					callback({ msg: 'INVALID_ATTR_COMBINATION', error: null });
				}
				else {
					hashPassword(new_password, function (e, new_passwordHash) {
						if(e) {
							callback({ msg: e.msg, error: e.error });
						}
						else {
							generateToken(function (e, token) {
								if(e) {
									callback({ msg: e.msg, error: e.error });
								}
								else {
									var tokenHash = hashToken(token);
									user.tokens = [{
										token		: tokenHash,
										expiration	: Date.now() + config.expiration
									}];
									user.password = new_passwordHash;
									user.save(function (e) {
										if(e) {
											callback({ msg: 'COULDNT_SAVE_USER_MODIFICATIONS', error: e });
										}
										else {
											callback(null, token);
										}
									});
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
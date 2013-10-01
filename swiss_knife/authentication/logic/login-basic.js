var Hash = require('../../hashing/Hash');
var hashToken = Hash.hashToken;
var compareHash = Hash.compareHash;
var generateToken = Hash.generateToken;

var UserModel = model('User');

exports.process = function (userid, password, state, callback) {

	UserModel.find({
		_id		: userid,
		state	: state
	}, function (e, user) {
		if(e) {
			callback({ msg: 'ERROR_WHILE_SEARCHING_DB', error: e });
		}
		else if(user) {
			compareHash(password, user.password, function (err, match) {
				if(err) {
					callback({ msg: err.msg, error: err.error });
				}
				else if(!match) {
					callback({ msg: 'INVALID_ATTR_COMBINATION', error: null });
				}
				else {
					generateToken(function (err, token) {
						if(err) {
							callback({ msg: err.msg, error: err.error });
						}
						else {
							for(var i = 0; i < user.tokens.length; i++) {
								if((user.tokens[i] === null) || (user.tokens[i].expiration < Date.now())) {
									user.tokens.splice(i, 0);
								}
							}
							if(user.tokens.length > config.maxDevices){
								user.tokens.splice(config.maxDevices, user.tokens.length);
							}
							var tokenHash = hashToken(token);
							user.tokens.push({
								token: tokenHash,
								expiration: Date.now() + config.expiration
							});
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

var Hash = require('../tools/Hash');
var hashPassword = Hash.hashPassword;
var generateToken = Hash.generateToken;
var hashToken = Hash.hashToken;

var validated = config.state.validated;

var UserModel = model('User');

function removeUser(users, i, callback) {
	if(i === user.length) {
		callback(null);
	}
	else {
		var user = users[i];
		if(user.state === validated) {
			callback({ msg: 'USER_ALREADY_EXISTS', error: null });
		}
		else {
			user.remove(function (e) {
				if(e) {
					callback({ msg: 'COULDNT_REMOVE_USER', error: e });
				}
				else {
					removeUser(users, i + 1, callback);
				}
			});
		}
	}
}

exports.process = function (userid, password, username, name, callback) {

	UserModel.find({
		$or			: [{
			_id		: userid
		}, {
			username: username
		}]
	}, function (e, users) {
		if(e) {
			callback({ msg: 'ERROR_WHILE_SEARCHING_DB', error: e });
		}
		else {
			removeUser(users, 0, function (e) {
				if(e) {
					callback({ msg: e.msg, error: e.error });
				}
				else {
					hashPassword(password, function (e, passwordHash) {
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
									UserModel({
										_id		: userid,
										username: username,
										password: passwordHash,
										name	: name,
										state	: state,
										tokens	: [{
											token: tokenHash,
											expiration: Date.now() + config.expiration
										}]
									}).save(function (e, savedUser) {
										if(e) {
											callback({ msg: 'COULDNT_SAVE_USER_MODIFICATIONS', error: e });
										}
										else {
											callback(null, token, savedUser);
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});

};

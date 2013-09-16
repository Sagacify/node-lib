var Hash = require('../tools/Hash');
var UserModel = model('User');

exports.process = function (userid, email, callback) {
	UserModel.findById(primaryValue, function (error, results) {
		if(error) {
			callback({ msg: 'ERROR_WHILE_SEARCHING_DB', error: error });
		}
		else if(!results || !results.length) {
			Hash.hashPassword(object.password, function (erro, passwordHash) {
				if(erro) {
					callback({ msg: erro.msg, error: erro.error });
				}
				else {
					Hash.generateToken(function (err, token) {
						if(err) {
							callback({ msg: err.msg, error: err.error });
						}
						else {
							var tokenHash = Hash.hashToken(token);
							UserModel({
								_id		: object.username,
								password: passwordHash,
								name	: object.name,
								email	: object.email,
								state	: config.state.unvalidated,
								tokens	: [{
									token: tokenHash,
									expiration: Date.now() + config.expiration
								}]
							}).save(function (er, savedUser) {
								if(er) {
									callback({ msg: 'COULDNT_SAVE_USER_MODIFICATIONS', error: er });
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
		else {
			(function removeUser(results, index, callback) {
				if(index === results.length) {
					exports.process(object, primaryKey, callback);
				}
				else if(results[index].state === config.state.validated) {
					callback({ msg: 'USER_ALREADY_EXISTS', error: null });
				}
				else {
					results[index].remove(function(error) {
						if(error) {
							callback({ msg: 'COULDNT_REMOVE_USER', error: error });
						}
						else {
							removeUser(results, index + 1, callback);
						}
					});
				}
			})(results, 0, callback);
		}
	});
};

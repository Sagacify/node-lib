var Hash = require('../tools/Hash');

exports.process = function(object, primaryKey, state, callback) {
	var primaryValue = object[primaryKey];
	var searchDict = {};
	searchDict[primaryKey] = primaryValue;
	model('User').find(searchDict, function(error, results) {
		if(error) {
			callback({ msg: 'ERROR_WHILE_SEARCHING_DB', error: error });
		}
		else if(results && (results.length === 1)) {
			var result = results[0];
			if(result.state !== state) {
				callback({ msg: 'USER_IN_WRONG_AUTHORIZATION_STATE', error: null });
			}
			else {
				Hash.compareHash(object.password, result.password, function(erro, match) {
					if(erro) {
						callback({ msg: erro.msg, error: erro.error });
					}
					else if(!match) {
						callback({ msg: 'INVALID_ATTR_COMBINATION', error: null });
					}
					else {
						Hash.hashPassword(object.new_password, function(err, new_passwordHash) {
							if(err) {
								callback({ msg: err.msg, error: err.error });
							}
							else {
								Hash.generateToken(function(er, token) {
									if(er) {
										callback({ msg: er.msg, error: er.error });
									}
									else {
										var tokenHash = Hash.hashToken(token);
										result.tokens.push({
											token: tokenHash,
											expiration: new Date().getTime() + config.expiration
										});
										result.password = new_passwordHash;
										result.save(function(e) {
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
		}
		else if(results && (results.length > 1)) {
			callback({ msg: 'MULTI_USERS_HAVE_SAME_ATTR_VALUE', error: null });
		}
		else {
			callback({ msg: 'NO_USER_WITH_THIS_ATTR_VALUE', error: null });
		}
	});
};
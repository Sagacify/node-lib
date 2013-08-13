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
						var firstToken = result.tokens[0];
						var matchIndex = (firstToken.token === Hash.hashToken(object.token)) ? 1 : -1;
						if((matchIndex === -1) || (firstToken.expiration < (new Date().getTime()))) {
							callback({ msg: 'INVALID_ATTR_COMBINATION', error: null });
						}
						else {
							Hash.generateToken(function(err, token) {
								if(err) {
									callback({ msg: err.msg, error: err.error });
								}
								else {
									var tokenHash = Hash.hashToken(token);
									result.state = !state;
									result.tokens[0].token = tokenHash;
									result.tokens[0].expiration = new Date().getTime() + config.expiration;
									result.save(function(er, user) {
										if(er) {
											callback({ msg: 'COULDNT_SAVE_USER_MODIFICATIONS', error: er });
										}
										else {
											callback(null, token, user);
										}
									});
								}
							});
						}
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

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
				var tokens = result.tokens;
				var nTokens = tokens.length;
				var matchIndex = -1;
				while(nTokens--) {
					if(tokens[nTokens].token === Hash.hashToken(object.token)) {
						matchIndex = nTokens;
						break;
					}
				}
				if((matchIndex === -1) || (tokens[matchIndex].expiration < (new Date().getTime()))) {
					callback({ msg: 'INVALID_ATTR_COMBINATION', error: null });
				}
				else {
					Hash.hashPassword(object.password, function(err, passwordHash) {
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
									result.password = passwordHash;
									result.state = !state;
									result.save(function(e, user) {
										if(e) {
											callback({ msg: 'COULDNT_SAVE_USER_MODIFICATIONS', error: e.error });
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

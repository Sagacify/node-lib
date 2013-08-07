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
				Hash.compareHash(object.password, result.password, function(err, match) {
					if(err) {
						callback({ msg: err.msg, error: err.error });
					}
					else if(!match) {
						callback({ msg: 'INVALID_ATTR_COMBINATION', error: null });
					}
					else {
						Hash.generateToken(function(err, token) {
							if(err) {
								callback({ msg: err.msg, error: err.error });
							}
							else {
								for(var i = 0; i < result.tokens.length; i++) {
									if(result.tokens[i].expiration < (new Date().getTime())) {
										result.tokens.splice(i, 0);
									}
								}
								var tokenHash = Hash.hashToken(token);
								if(result.tokens.length > config.maxDevices){
									result.tokens.splice(config.maxDevices, result.tokens.length);
								}
								result.tokens.push({
									token: tokenHash,
									expiration: new Date().getTime() + config.expiration
								});
								result.save(function(e, user) {
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
		}
		else if(results && (results.length > 1)) {
			callback({ msg: 'MULTI_USERS_HAVE_SAME_ATTR_VALUE', error: null });
		}
		else {
			callback({ msg: 'NO_USER_WITH_THIS_ATTR_VALUE', error: null });
		}
	});
};

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
				Hash.generateToken(function(err, token) {
					if(err) {
						callback({ msg: err.msg, error: err.error });
					}
					else {
						var tokenHash = Hash.hashToken(token);
						result.tokens = [{
							token: tokenHash,
							expiration: new Date().getTime() + config.expiration
						}];
						result.state = !state;
						result.save(function(er, user) {
							if(er) {
								callback({ msg: 'COULDNT_SAVE_USER_MODIFICATIONS', error: er });
							}
							else {
								user.token = token;
								callback(null, token, user);
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
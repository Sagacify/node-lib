var Hash = require('../../hashing/Hash');
var hashToken = Hash.hashToken;

module.export = function (mixin, callback) {
	var hashed_token = mixin.hashed_token;
	var i = mixin.user.tokens.length;
	var match = false;
	var token;
	while(i--) {
		token = mixin.user.tokens[i];
		if((hashed_token === hashToken(token.token)) && (token.expiration > Date.now())) {
			match = i;
			break;
		}
	}
	if(match !== false) {
		mixin.token_match = match;
		callback(null, mixin);
	}
	else {
		callback('INVALID_ATTR_COMBINATION');
	}
};
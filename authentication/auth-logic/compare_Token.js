var Hash = require('../../hashing/Hash');

module.exports = function (mixin, callback) {
	var hashed_token = mixin.hashed_token;
	var i = mixin.user.tokens.length;
	var now = Date.now();
	var match = false;
	var token;
	while(i--) {
		token = mixin.user.tokens[i];
		if((hashed_token === token.token) && (token.expiration > now)) {
			//match = true;
			match = i;
			break;
		}
	}

	if(match === false) {
		callback('INVALID_ATTR_COMBINATION');
	}
	else {
		mixin.token_match = match;
		callback(null, mixin);
	}
};
var Hash = require('../../hashing/Hash');

module.exports = function (mixin, callback) {
	var hashed_token = mixin.hashed_token;
	console.log(hashed_token);
	console.log(mixin);
	var i = mixin.user.tokens.length;
	var now = Date.now();
	var match = false;
	var token;
	while(i--) {
		token = mixin.user.tokens[i];
		if((hashed_token === token.token) && (token.expiration > now)) {
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
var Hash = require('../../hashing/Hash');
var hashToken = Hash.hashToken;

var expiration = config.expiration;

module.exports = function (mixin, callback) {
	mixin.hashed_token = hashToken(mixin.token);
	if(mixin.user.tokens) {
		mixin.user.tokens.unshift({
			token		:	mixin.hashed_token,
			expiration	:	Date.now() + expiration
		});
	}
	else {
		mixin.user.tokens = [{
			token		:	mixin.hashed_token,
			expiration	:	Date.now() + expiration
		}];
	}
	callback(null, mixin);
};
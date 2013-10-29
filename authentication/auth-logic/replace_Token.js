var expiration = config.expiration;

module.exports = function (mixin, callback) {
	mixin.user.tokens = [{
		token		:	mixin.hashed_token,
		expiration	:	Date.now() + expiration
	}];
	callback(null, mixin);
};
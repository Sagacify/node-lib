var Hash = require('../../hashing/Hash');
var hashToken = Hash.hashToken;

var expiration = config.expiration;

module.exports = function (mixin, callback) {
	mixin.user.tokens.unshift({
		token		:	hashToken(mixin.token),
		expiration	:	Date.now() + expiration
	});
	callback(null, mixin);
};
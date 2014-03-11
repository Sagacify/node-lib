module.exports = function (mixin, callback) {
	mixin.user.tokens.splice(mixin.token_match, 1);
	callback(null, mixin);
};
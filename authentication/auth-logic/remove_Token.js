module.exports = function (mixin, callback) {
	mixin.user.tokens.splice(mixin.match, 1);
	callback(null, mixin);
};
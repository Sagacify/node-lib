var expiration = config.expiration;

module.exports = function (mixin, callback) {
	var user = mixin.user_attr;
	user.state = mixin.resultingState;
	mixin.user = model('User')(user);
	callback(null, mixin);
};
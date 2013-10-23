var UserModel = model('User');

module.exports = function (mixin, callback) {
	var user = mixin.user_attr;
	user.tokens = [{
		token		:	mixin.hashed_token,
		expiration	:	new Date() + config.expiration
	}];
	mixin.user = UserModel(user);
	callback(null, mixin);
};
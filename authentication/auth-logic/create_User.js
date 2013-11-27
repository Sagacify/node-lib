var UserModel = model('User');

var expiration = config.expiration;

module.exports = function (mixin, callback) {
	var user = mixin.user_attr;
	user.state = mixin.resultingState;
	//mixin.user = UserModel().set(user);
	mixin.user = UserModel(user);
	callback(null, mixin);
};
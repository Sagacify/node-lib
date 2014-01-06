var UserModel = model('User');

var expiration = config.expiration;

module.exports = function (mixin, callback) {
	var user = mixin.user_attr;
	user.state = mixin.resultingState;
	mixin.user = UserModel({
		state: user.state
	});
	delete user.state;
	mixin.user.firstSet(user, function (e) {
		if(e) {
			callback(e);
		}
		else {
			callback(null, mixin);
		}
	});
};
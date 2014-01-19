var UserModel = model('User');
var expiration = config.expiration;

module.exports = function (mixin, callback) {
	var user = mixin.user_attr;
	user.state = mixin.resultingState;
	mixin.user = UserModel({
		state: user.state
	});
	if(mixin.req) {
		mixin.user.buildContext(mixin.req);
		// console.log(mixin.req);
		// console.log(mixin.user);
		// console.log(mixin.context);
	}
	delete user.state;
	mixin.user[mixin.user.firstSet ? 'firstSet' : 'set'](user, function (e) {
		if(e) {
			callback(e);
		}
		else {
			callback(null, mixin);
		}
	});
};
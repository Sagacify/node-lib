
var UserModel = model('User');
var expiration = config.expiration;

module.exports = function (mixin, callback) {
	var user = mixin.user_attr;
	user.state = mixin.resultingState;
	mixin.user = UserModel({
		state: user.state
	});
	delete user.state;
	console.log('PASS - 0');
	mixin.user[mixin.user.firstSet ? 'firstSet' : 'set'](user, function (e) {
		if(e) {
			console.log('PASS - 5');
			callback(e);
		}
		else {
			console.log('PASS - 6');
			callback(null, mixin);
		}
	});
};
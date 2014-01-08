
var UserModel = model('User');
var expiration = config.expiration;

module.exports = function (mixin, callback) {
	var user = mixin.user_attr;
	user.state = mixin.resultingState;
	mixin.user = UserModel({
		state: user.state
	});
	delete user.state;
	if(typeof mixin.user.firstSet == "function"){
		mixin.user.firstSet(user, function (e) {
			if(e) {
				callback(e);
			}
			else {
				callback(null, mixin);
			}
		});
	}
	else{
		mixin.user.set(user, function (e) {
			if(e) {
				callback(e);
			}
			else {
				callback(null, mixin);
			}
		});
	}

};
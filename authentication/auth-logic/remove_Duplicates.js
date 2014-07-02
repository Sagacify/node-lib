var each = require('async').each;

module.exports = function (mixin, callback) {
	if(!mixin.removedUsers) {
		mixin.removedUsers = [];
	}
	var newUsers = [];
	var newUser;
	each(mixin.users, function (user, cb) {
		if(user.state > mixin.expectedState && user[mixin.fakeUserProp] !== true) {
			return cb('USER_ALREADY_EXISTS');
		}
		if(/*(mixin.users.length > 1) && */mixin.fakeUserId && mixin.fakeUserId.toString() === user._id.toString()) {
			newUsers.push(user);
			newUser = user;
			mixin.fakeUserId = null;
			return cb(null);
		}

		mixin.removedUsers.push(user._id);
		user.remove(function (e) {
			if(e) {
				cb('COULDNT_REMOVE_USER');
			}
			else {
				cb(null);
			}
		});
	}, function (e) {
		if(e) {
			callback(e);
		}
		else {
			mixin.users = newUsers;
			mixin.user = newUser;
			callback(null, mixin);
		}
	});
};
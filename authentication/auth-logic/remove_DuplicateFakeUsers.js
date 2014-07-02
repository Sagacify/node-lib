var each = require('async').each;

module.exports = function (mixin, callback) {
	mixin.removedUsers = [];
	each(mixin.users, function (user, cb) {
		if(user.state > mixin.expectedState && user[mixin.fakeUserProp] !== true) {
			cb('USER_ALREADY_EXISTS');
		}
		else {
			mixin.removedUsers.push(user._id);
			user.remove(function (e) {
				if(e) {
					cb('COULDNT_REMOVE_USER');
				}
				else {
					cb(null);
				}
			});
		}
	}, function (e) {
		if(e) {
			callback(e);
		}
		else {
			callback(null, mixin);
		}
	});
};
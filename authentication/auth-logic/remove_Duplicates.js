var each = require('async').each;

module.exports = function (mixin, callback) {
	each(mixin.users, function (user, cb) {
		if(user.state > mixin.expectedState) {
			cb('USER_ALREADY_EXISTS');
		}
		else {
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
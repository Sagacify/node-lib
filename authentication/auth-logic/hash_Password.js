var Hash = require('../../hashing/Hash');
var hashPassword = Hash.hashPassword;

module.exports = function (mixin, callback) {
	var password = mixin.new_password || mixin.password;
	hashPassword(password, function (e, hashed_password) {
		if(e) {
			callback(e);
		}
		else {
			mixin.user.password = hashed_password;
			callback(null, mixin);
		}
	});
};
var Hash = require('../../hashing/Hash');
var compareHash = Hash.compareHash;

module.exports = function (mixin, callback) {
	compareHash(mixin.password, mixin.user.password, function (e, match) {
		if(e) {
			callback('COULDNT_COMPARE_HASH');
		}
		else if(!match) {
			callback('INVALID_ATTR_COMBINATION');
		}
		else {
			callback(null, mixin);
		}
	});
};
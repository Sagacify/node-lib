var Hash = require('../../hashing/Hash');
var generateToken = Hash.generateToken;

module.exports = function (mixin, callback) {
	generateToken(function (e, token) {
		if(e) {
			callback('COULDNT_HASH_TOKEN');
		}
		else {
			mixin.token = token;
			callback(null, mixin);
		}
	});
};
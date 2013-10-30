var Hash = require('../../hashing/Hash');
var hashToken = Hash.hashToken;

module.exports = function (mixin, callback) {
	var token = mixin.token;
	mixin.hashed_token = hashToken(token);
	callback(null, mixin);
};
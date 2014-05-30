module.exports = function (mixin, callback) {
	var i = mixin.user.tokens.length;
	var fresh_tokens = [];
	while(i--) {
		if(mixin.user.tokens[i].expiration > Date.now()) {
			fresh_tokens.splice(0, 0, mixin.user.tokens[i]);
		}
	}
	mixin.user.tokens = fresh_tokens;
	callback(null, mixin);
};
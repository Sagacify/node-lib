module.exports = function (mixin, callback) {
	var i = mixin.user.tokens.length;
	var fresh_tokens = [];
	console.log('REMOVE EXPIRED TOKENS')
	console.log(mixin.user.tokens)
	while(i--) {
		if(mixin.user.tokens[i].expiration > Date.now()) {
			fresh_tokens.shift(mixin.user.tokens[i]);
		}
	}
	console.log(fresh_tokens);
	mixin.user.tokens = fresh_tokens;
	callback(null, mixin);
};
module.exports = function (mixin, callback) {
	console.log('REMOVE TOKEN')
	console.log(new Error().stack)
	mixin.user.tokens.splice(mixin.token_match, 1);
	callback(null, mixin);
};
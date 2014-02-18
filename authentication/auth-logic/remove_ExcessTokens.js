var maxDevices = config.maxDevices;

module.exports = function (mixin, callback) {
	if(mixin.user.tokens.length > config.maxDevices) {
		console.log('REMOVE EXCESS TOKEN')
		console.log(new Error().stack)
		mixin.user.tokens.splice(0, maxDevices);
	}
	callback(null, mixin);
};
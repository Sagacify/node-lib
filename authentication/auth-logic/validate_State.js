module.exports = function (mixin, callback) {
	if(mixin.user.state !== mixin.expectedState) {
		callback('INVALID_STATE');
	}
	else {
		callback(null, mixin);
	}
};
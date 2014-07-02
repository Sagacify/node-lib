module.exports = function (mixin, callback) {
	if(Array.isArray(mixin.expectedState) && mixin.expectedState.indexOf(mixin.user.state)==-1) {
		callback('INVALID_STATE');
	}
	else if(!Array.isArray(mixin.expectedState) && mixin.user.state !== mixin.expectedState) {
		callback('INVALID_STATE');
	}
	else {
		callback(null, mixin);
	}
};
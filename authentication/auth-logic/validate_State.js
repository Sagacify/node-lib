module.exports = function (mixin, callback) {
	console.log('IN state')
	console.log(mixin.expectedState)
	console.log(mixin.user)
	if(Array.isArray(mixin.expectedState) && !~mixin.expectedState.indexOf(mixin.user.state)) {
		callback('INVALID_STATE');
	}
	else if(!Array.isArray(mixin.expectedState) && mixin.user.state !== mixin.expectedState) {
		callback('INVALID_STATE');
	}
	else {
		callback(null, mixin);
	}
};
module.exports = function (mixin, callback) {
	console.log('User state -> ' + mixin.user.state);
	console.log('Mixin state -> ' + mixin.expectedState);
	if(Array.isArray(mixin.expectedState) && !~mixin.expectedState.indexOf(mixin.user.state)) {
		console.log('++1');
		callback('INVALID_STATE');
	}
	else if(!Array.isArray(mixin.expectedState) && mixin.user.state !== mixin.expectedState) {
		console.log('++2');
		callback('INVALID_STATE');
	}
	else {
		callback(null, mixin);
	}
};
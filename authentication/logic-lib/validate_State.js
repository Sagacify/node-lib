module.export = function (mixin, callback) {
	if(mixin.user.state !== mixin.required_state) {
		callback('INVALID_STATE');
	}
	else {
		callback(null, mixin);
	}
};
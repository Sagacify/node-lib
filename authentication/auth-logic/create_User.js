module.exports = function (mixin, callback) {
	var user = mixin.user_attr;

	user.state = mixin.resultingState;
	mixin.user = model('User')({
		state: user.state
	});
	delete user.state;

	if(mixin.req) {
		mixin.user.buildContext(mixin.req);
	}

	var fakeUserProp = mixin.fakeUserProp;
	if(typeof fakeUserProp === 'string' && fakeUserProp.length) {
		mixin.user.set(fakeUserProp, true);
		delete user[fakeUserProp];
	}

	console.log('> CREATE USER OUT - 0 : <');
	console.log(user);

	mixin.user[mixin.user.firstSet ? 'firstSet' : 'set'](user, function (e) {
		if(e) {
			console.log('> CREATE USER OUT - 1 : <');
			console.log(e.stack || e);
			return callback(e);
		}
		console.log('> CREATE USER OUT - 2 : <');
		console.log(mixin.user);
		callback(null, mixin);
	});
};
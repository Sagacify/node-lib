module.exports = function (mixin, callback) {
	var search = {};
	var qs = mixin.search[1];
	if(typeof qs === 'string' && qs.length) {
		search[mixin.search[0]] = qs.toLowerCase();

		var fakeUserProp = mixin.fakeUserProp;
		if(typeof fakeUserProp === 'string' && fakeUserProp.length && mixin.action !== 'RegisterFakeUser') {
			search[fakeUserProp] = {
				$ne: true
			};
		}

		model('User').find(search, function (e, users) {
			if(e) {
				return callback('COULDNT_FIND_USER');
			}
			
			if(mixin.action !== 'Register' && mixin.action !== 'RegisterFakeUser' && (!users || !users.length)) {
				return callback('INVALID_ATTR_COMBINATION');
			}

			mixin.users = users;
			mixin.user = users[0];

			console.log('\n> FIND() results !');
			console.log(mixin.action);
			console.log(search);
			console.log(users);

			if(users && users.length && mixin.action === 'RegisterFakeUser') {
				console.log('\n> HACK - BREAK RegisterFakeUser !');
				console.log(mixin);
				callback(true, mixin); // Hack on Async.js's waterfall to break out early AND return a result
			}
			else {
				callback(null, mixin);
			}
		});
	}
	else {
		callback('INVALID_QUERY_STRING');
	}
};
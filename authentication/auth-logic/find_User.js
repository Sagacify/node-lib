module.exports = function (mixin, callback) {
	var search = {};
	var qs = mixin.search[1];
	if((typeof qs === 'string') && qs.length) {
		search[mixin.search[0]] = qs.toLowerCase();
		console.log(search);
		model('User').find(search, function (e, users) {
			console.log(arguments);
			if(e) {
				callback('COULDNT_FIND_USER');
			}
			else if((mixin.action !== 'Register') && (!users || !users.length)) {
				callback('INVALID_ATTR_COMBINATION');
			}
			else {
				mixin.users = users;
				mixin.user = users[0];
				callback(null, mixin);
			}
		});
	}
	else {
		callback('INVALID_QUERY_STRING');
	}
};
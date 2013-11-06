var UserModel = model('User');

module.exports = function (mixin, callback) {
	var search = {};
	search[mixin.search[0]] = mixin.search[1];
	UserModel.find(search, function (e, users) {
		if(e) {
			callback('COULDNT_FIND_USER');
		}
		else if((mixin.action !== 'Register') && (!users || !users.length)) {
			callback('INVALID_ATTR_COMBINATION');
		}
		else if(users.length > 1) {
			mixin.users = users;
			mixin.user = users[0];
			callback(null, mixin);
		}
		else {
			mixin.users = [];
			mixin.user = users[0];
			callback(null, mixin);
		}
	});
};
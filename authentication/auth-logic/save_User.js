module.exports = function (mixin, callback) {
	mixin.user.save(function (e, user) {
		if(e) {
			callback('COULDNT_SAVE_USER');
		}
		else {
			mixin.user = user;
			callback(null, mixin);
		}
	});
};
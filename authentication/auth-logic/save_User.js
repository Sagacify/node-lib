module.exports = function (mixin, callback) {
	mixin.user.save(function (e, user) {
		if(e) {
			console.log(e.stack || e);
			callback('COULDNT_SAVE_USER');
		}
		else {
			mixin.user = user;
			callback(null, mixin);
		}
	});
};
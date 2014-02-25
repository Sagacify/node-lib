module.exports = function (mixin, callback) {
	console.log('\n> SAVE USER - 1:');
	console.log(mixin.action);
	mixin.user.save(function (e, user) {
		if(e) {
			console.log(e);
			callback('COULDNT_SAVE_USER');
		}
		else {
			console.log('\n> SAVE USER - 2:');
			mixin.user = user;
			callback(null, mixin);
		}
	});
};
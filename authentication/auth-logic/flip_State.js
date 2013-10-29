module.exports = function (mixin, callback) {
	mixin.user.state = !mixin.user.state;
	callback(null, mixin);
};
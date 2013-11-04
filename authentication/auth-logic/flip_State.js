module.exports = function (mixin, callback) {
	mixin.user.state = mixin.resultingState;
	callback(null, mixin);
};
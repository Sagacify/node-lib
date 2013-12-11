var formatIs = require('../../strict_typing/validateFormat.js');

module.exports = function (mixin, callback) {
	var authorization = mixin.authorization;
	if(authorization.indexOf('bearer ') === 0) {
		var stripStrategy = authorization.replace(/bearer /g, '');
		var bearerElements = stripStrategy.split('|');
		if(bearerElements.length === 2) {
			var userid = bearerElements[0];
			var token = bearerElements[1];
			if(/*formatIs.mongo_ObjectId_hex(userid) &&*/ formatIs.isToken_hex(token)) {
			//if(true) { // DANGEROUS : no validation yet !!!
				mixin.token = token;
				mixin.search.push(userid);
				callback(null, mixin);
			}
			else {
				callback('INVALID_TOKEN');
			}
		}
		else {
			callback('INVALID_TOKEN');
		}
	}
	else {
		callback('INVALID_TOKEN');
	}
};
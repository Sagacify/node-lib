//var validatorInstance = require('../../validation/Validator.js');
//var check = validatorInstance.check;

module.exports = function (mixin, callback) {
	var authorization = mixin.authorization;
	if(authorization.indexOf('bearer ') === 0) {
		var stripStrategy = authorization.replace(/bearer /g, '');
		var bearerElements = stripStrategy.split('|');
		if(bearerElements.length === 2) {
			var userid = bearerElements[0];
			var token = bearerElements[1];
			//if(check(userid).mongo_ObjectId_hexWeb() && check(token).isSha2_Hash_hexWeb()) {
			if(true) { // DANGEROUS : no validation yet !!!
				mixin.token = token;
				mixin.unique.push(userid);
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
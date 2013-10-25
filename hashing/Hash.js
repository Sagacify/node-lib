var bcrypt = require('bcrypt');
var Pepper = require('./Pepper');
var crypto = require('crypto');

exports.hashPassword = function(password, callback) {
	exports.generateSalt(function(error, salt) {
		if(error) {
			callback({ msg: error.msg, error: error.error });
		}
		else {
			bcrypt.hash(password, salt, function(err, hash) {
				if(err) {
					callback({ msg: 'COULDNT_HASH_STRING', error: err });
				}
				else {
					callback(null, hash);
				}
			});
		}
	});
};

exports.compareHash = function(password, hash, callback) {
	bcrypt.compare(password, hash, function(error, match) {
		if(error) {
			callback({ msg: 'COULDNT_COMPARE_HASH', error: error });
		}
		else {
			callback(null, match);
		}
	});
};

exports.generateSalt = function(callback) {
	bcrypt.genSalt(10, function(error, salt) {
		if(error) {
			callback({ msg: 'COULDNT_GENERATE_SALT', error: error });
		}
		else {
			callback(null, salt);
		}
	});
};

exports.generateToken = function(callback) {
	crypto.randomBytes(128, function(error, buffer) {
		if(error) {
			callback({ msg: 'COULDNT_GENERATE_TOKEN', error: error });
		}
		else {
			callback(null, buffer.toString('hex'));
		}
	});
};

exports.hashToken = function(salt) {
	var hashFunc = (config.tokensize === '256') ? 'sha256' : 'sha512';
	var sha512 = crypto.createHash(hashFunc);
	sha512.update(salt + Pepper.getPepper());
	return sha512.digest('hex');
};

exports.hashHmacSha256 = function(salt, text) {
	var hmacSha256 = crypto.createHmac('sha256', salt);
	hmacSha256.update(text);
	return hmacSha256.digest('hex');
};

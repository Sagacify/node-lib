var Caja = require('./GoogleCaja.js');

var tokenSize = (config.tokensize === '256') ? 256 : 512;
var objectidSize = 3072;

function bitSize_to_nthSize(bitsize, nthsize) {
	if((bitsize === 3072) && (nthsize === 64)) {
		return 16;
	}
	else if((bitsize === 3072) && (nthsize === 16)) {
		return 24;
	}
	else if((bitsize === 256) && (nthsize === 16)) {
		return 64;
	}
	else if((bitsize === 256) && (nthsize === 16)) {
		return 44;
	}
	else if((bitsize === 512) && (nthsize === 16)) {
		return 88;
	}
	else if((bitsize === 512) && (nthsize === 16)) {
		return 128;
	}
	//var pow = Math.pow(2, nthsize);
	//return (bitsize > pow) ? 1 : (pow / bitsize) | 0;
}

function mongo_ObjectId (base, isWeb) {
	var str = this.str;
	var len = str.length;
	if((base === 16) && (len === objectidLen(16)) && isLowerHexadecimal(str)) {
		return this;
	}
	else if((base === 64) && (len === objectidLen(64)) && isBase64(str, isWeb)) {
		return this;
	}
	else if((base !== 16) && (base !== 64)) {
		this.error(base + ' is not a valid encoding format (16 for hex / 64 for base64)');
	}
	else {
		this.error(str + ' is not a valid MongoDB ObjectId of length ' + objectidSize + ' in base ' + base);
	}
}

function isSha2_Hash (base, isWeb) {
	var str = this.str;
	var len = str.length;
	if((base === 16) && (len === tokenLen(16)) && isLowerHexadecimal(str)) {
		return this;
	}
	else if((base === 64) && (len === tokenLen(64)) && isBase64(str, isWeb)) {
		return this;
	}
	else if((base !== 16) && (base !== 64)) {
		this.error(base + ' is not a valid encoding format (16 for hex / 64 for base64)');
	}
	else {
		this.error(str + ' is not a valid sha' + tokenSize + ' ' + base + ' token');
	}
}

function tokenLen(base) {
	return bitSize_to_nthSize(tokenSize, base);
}

function objectidLen(base) {
	return bitSize_to_nthSize(objectidSize, base);
}

function isLowerHexadecimal () {
	return str.match(/^[0-9a-f]+$/);
}

function isWebBase64 () {
	return str.match(/^[0-9a-zA-Z\-_]+$/);
}

function isBase64 (str, isWeb) {
	return isWeb ? str.match(/^[0-9a-zA-Z\-\_]+$/) : str.match(/^[0-9a-zA-Z\+\/]+$/);
}

/**
* From here on, exported function will be attached to the Validator prototype
*/

exports.isSha2_Hash_base64Web = function () {
	return mongo_ObjectId.apply(this, [64, true]);
};

exports.isSha2_Hash_base64 = function () {
	return mongo_ObjectId.apply(this, [64, false]);
};

exports.isSha2_Hash_hexWeb = function () {
	return mongo_ObjectId.apply(this, [16, true]);
};

exports.isSha2_Hash_hex = function () {
	return mongo_ObjectId.apply(this, [16, false]);
};

exports.mongo_ObjectId_base64Web = function () {
	return mongo_ObjectId.apply(this, [64, true]);
};

exports.mongo_ObjectId_base64 = function () {
	return mongo_ObjectId.apply(this, [64, false]);
};

exports.mongo_ObjectId_hexWeb = function () {
	return mongo_ObjectId.apply(this, [16, true]);
};

exports.mongo_ObjectId_hex = function () {
	return mongo_ObjectId.apply(this, [16, false]);
};

exports.cajaData = function () {
	return Caja.escape(this);
};

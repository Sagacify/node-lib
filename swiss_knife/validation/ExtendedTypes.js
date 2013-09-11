var tokenSize = (config.tokensize === '256') ? 256 : 512;
var objectidSize = 3072;

function bitSize_to_nthSize(bitsize, nthsize) {
	var pow = Math.pow(2, nthsize);
	return (bitsize > pow) ? 1 : (pow / bitsize) | 0;
}

function tokenLen(base) {
	bitSize_to_nthSize(tokenSize, base);
}

function objectidLen(base) {
	bitSize_to_nthSize(objectidSize, base);
}

function isLowerHexadecimal () {
	return str.match(/^[0-9a-f]+$/);
}

function isWebBase64 () {
	return str.match(/^[0-9a-zA-Z\-_]+$/);
}

function isBase64 (str, isWeb) {
	return str.match(/^[0-9a-zA-Z]+$/) && str.match(isWeb ? /^[\+\/]+$/ : /^[\+\/]+$/);
}

// From here on, exported function will be attached to the Validator prototype

exports.isSha2_Hash = function (base, isWeb) {
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
};

exports.mongo_ObjectId = function (base, isWeb) {
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
};

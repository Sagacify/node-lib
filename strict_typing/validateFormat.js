var tokenSize = (config.tokensize === '256') ? 256 : 512;
var objectidSize = 3072;

function bitSize_to_nthSize (bitsize, nthsize) {
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

function mongo_ObjectId (str, base, isWeb) {
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

function isSha2_Hash (str, base, isWeb) {
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

function isBase64 (str, isWeb) {
	return isWeb ? str.match(/^[0-9a-zA-Z\-\_]+$/) : str.match(/^[0-9a-zA-Z\+\/]+$/);
}

/**
* From here on, exported function will be attached to the Validator prototype
*/

exports.isEmail = function (str) {
	return str.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/);
};

exports.isUrl = function (str) {
	//A modified version of the validator from @diegoperini / https://gist.github.com/729294
	return str.length < 2083 && str.match(/^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i);
};

exports.isIP = function (str) {
	return exports.isIPv4(str) || exports.isIPv6(str);
};

exports.isIPv4 = function (str) {
	if(/^(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)$/.test(str)) {
		var parts = str.split('.').sort();
		// no need to check for < 0 as regex won't match in that case
		if(parts[3] > 255) {
			return false;
		}
		return true;
	}
	return false;
};

exports.isIPv6 = function (str) {
	if(/^::|^::1|^([a-fA-F0-9]{1,4}::?){1,7}([a-fA-F0-9]{1,4})$/.test(str)) {
		return true;
	}
	return false;
};

exports.isIPNet = function (str) {
	return validators.isIP(str) !== 0;
};

exports.isAlpha = function (str) {
	return str.match(/^[a-zA-Z]+$/);
};

exports.isAlphanumeric = function (str) {
	return str.match(/^[a-zA-Z0-9]+$/);
};

exports.isNumeric = function (str) {
	return str.match(/^-?[0-9]+$/);
};

exports.isHexadecimal = function (str) {
	return str.match(/^[0-9a-fA-F]+$/);
};

exports.isHexColor = function (str) {
	return str.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
};

exports.isLowercase = function (str) {
	return str === str.toLowerCase();
};

exports.isUppercase = function (str) {
	return str === str.toUpperCase();
};

exports.isInt = function (str) {
	return str.match(/^(?:-?(?:0|[1-9][0-9]*))$/);
};

exports.isDecimal = function (str) {
	return str !== '' && str.match(/^(?:-?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/);
};

exports.isFloat = function (str) {
	return exports.isDecimal(str);
};

exports.isDivisibleBy = function (str, n) {
	return (parseFloat(str) % parseInt(n, 10)) === 0;
};

exports.notNull = function (str) {
	return str !== '';
};

exports.isNull = function (str) {
	return str === '';
};

exports.notEmpty = function (str) {
	return !str.match(/^[\s\t\r\n]*$/);
};

exports.equals = function (a, b) {
	return a == b;
};

exports.contains = function (str, elem) {
	return str.indexOf(elem) >= 0 && !!elem;
};

exports.notContains = function (str, elem) {
	return !exports.contains(str, elem);
};

exports.isUUID = function (str, version) {
	var pattern;
	if(version == 3 || version == 'v3') {
		pattern = /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i;
	} else if(version == 4 || version == 'v4') {
		pattern = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
	} else if(version == 5 || version == 'v5') {
		pattern = /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
	} else {
		pattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;
	}
	return pattern.test(str);
};

exports.isUUIDv3 = function (str) {
  return exports.isUUID(str, 3);
};

exports.isUUIDv4 = function (str) {
	return exports.isUUID(str, 4);
};

exports.isUUIDv5 = function (str) {
	return exports.isUUID(str, 5);
};

exports.isSha2_Hash_base64Web = function (str) {
	return exports.isSha2_Hash(str, 64, true);
};

exports.isSha2_Hash_base64 = function (str) {
	return exports.isSha2_Hash(str, 64, false);
};

exports.isSha2_Hash_hexWeb = function (str) {
	return exports.isSha2_Hash(str, 16, true);
};

exports.isSha2_Hash_hex = function (str) {
	return exports.isSha2_Hash(str, 16, false);
};

exports.mongo_ObjectId_base64Web = function (str) {
	return exports.mongo_ObjectId(str, 64, true);
};

exports.mongo_ObjectId_base64 = function (str) {
	return exports.mongo_ObjectId(str, 64, false);
};

exports.mongo_ObjectId_hexWeb = function (str) {
	return exports.mongo_ObjectId(str, 16, true);
};

exports.mongo_ObjectId_hex = function (str) {
	return exports.mongo_ObjectId(str, 16, false);
};

exports.lenInferiorTo = function (maxLen) {
	return this.str.length < maxLen;
};

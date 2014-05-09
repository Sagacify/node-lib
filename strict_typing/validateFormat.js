var is = require('./validateType');

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
	if((base === 16) && (len === 24) && isLowerHexadecimal(str)) {
		return true;
	}
	else if((base === 64) && (len === 16) && isBase64(str, isWeb)) {
		return true;
	}
	else {
		return false;
	}
}

function isSha2_Hash (str, base, isWeb) {
	var len = str.length;
	if((base === 16) && (len === 64) && isLowerHexadecimal(str)) {
		return true;
	}
	else if((base === 64) && (len === 44) && isBase64(str, isWeb)) {
		return true;
	}
	else {
		return false;
	}
}

function isToken (str, base, isWeb){
	var len = str.length;
	if((base === 16) && (len === 256) && isLowerHexadecimal(str)) {
		return true;
	}
	else if((base === 64) && (len === 172) && isBase64(str, isWeb)) {
		return true;
	}
	else {
		return false;
	}
}

function tokenLen(base) {
	return bitSize_to_nthSize(tokenSize, base);
}

function isLowerHexadecimal (str) {
	return !!str.match(/^[0-9a-f]+$/);
}

function isBase64 (str, isWeb) {
	return isWeb ? str.match(/^[0-9a-zA-Z\-\_]+$/) : str.match(/^[0-9a-zA-Z\+\/]+$/);
}

/**
* From here on, exported function will be attached to the Validator prototype
*/

exports.isEmail = function (str) {
	return !!str.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/);
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

exports.isBelgianVat = function (str) {
	return !!str.match(/^BE0[0-9]{3}\.[0-9]{3}\.[0-9]{3}$/i);
};

exports.inFuture = function (date) {
	var now = new Date();
	// compare to the previous day to make sure that the validation
	// doensn't invalidate dates that were created a few hours ago
	return date > now.setDate(now.getDate() - 1);
};

exports.superiorOrEqualTo = function (num, min) {
	return num >= min;
};

exports.inferiorOrEqualTo = function (num, max) {
	return num <= max;
};

exports.isIPNet = function (str) {
	return validators.isIP(str) !== 0;
};

exports.isAlpha = function (str) {
	return !!str.match(/^[a-zA-Z]+$/);
};

exports.isAlphanumeric = function (str) {
	return !!str.match(/^[a-zA-Z0-9]+$/);
};

exports.isTrue = function (bool) {
	return bool === true;
};

exports.isNumeric = function (str) {
	return !!str.match(/^-?[0-9]+$/);
};

exports.isHexadecimal = function (str) {
	return !!str.match(/^[0-9a-fA-F]+$/);
};

exports.isHexColor = function (str) {
	return !!str.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
};

exports.isLowercase = function (str) {
	return str === str.toLowerCase();
};

exports.isUppercase = function (str) {
	return str === str.toUpperCase();
};

exports.isInt = function (str) {
	return !!str.match(/^(?:-?(?:0|[1-9][0-9]*))$/);
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

exports.isVersion = function (str) {
	return !!str.match(/^([0-9]+\.?)+$/g)
};



exports.inferiorTo = function (num, value) {
	return num < value;
};

exports.equalTo = function (num, value) {
	return num === value;
};

exports.superiorTo = function (num, value) {
	return num > value;
};

exports.inTitleList = function (str) {
	return (str === 'Mr') || (str === 'Ms');
};

exports.minDate = function (date, minDate) {
	return date >= minDate;
};

exports.maxDate = function (date, maxDate) {
	return date <= maxDate;
};

exports.contains = function (str, elem) {
	return str.indexOf(elem) >= 0 && !!elem;
};

exports.supportedLang = function (str) {
	return true;
	//return config && config.supported_langs && !!~config.supported_langs.indexOf(str.toLowerCase());
};

exports.notContains = function (str, elem) {
	return !exports.contains(str, elem);
};

exports.isPhoneNumber = function (str) {
	return !!str.match(/^[0-9\s\+]+$/);
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

exports.isSha2_Hash_hex = function (str) {
	return isSha2_Hash(str, 16, false);
};

exports.isToken_hex = function(str){
	return isToken(str, 16);
};

exports.mongo_ObjectId_base64Web = function (str) {
	return mongo_ObjectId(str, 64, true);
};

exports.mongo_ObjectId_base64 = function (str) {
	return mongo_ObjectId(str, 64, false);
};

exports.mongo_ObjectId_hex = function (str) {
	return mongo_ObjectId(str, 16, false);
};

exports.lenInferiorTo = function (str, maxLen) {
	return str.length < maxLen;
};

exports.lenEqualTo = function (str, maxLen) {
	return str.length === maxLen;
};

exports.lenSuperiorTo = function (str, maxLen) {
	return str.length > maxLen;
};

exports.timeString = function (str) {
	return is.String(str) && !!str.match(/^([0-1][0-9]|[0-2][0-3])\:([0-6][0-9])$/);
};

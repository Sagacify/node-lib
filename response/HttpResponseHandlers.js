var Verbose = require('../../../config/verbose_errors.json');

// If the user's token doesn't match
exports.authFail = function (res) {
	res.send(401);
};

// If a parameter is missing in the parameter list specified in the controller's
// data validation object
exports.missingParams = function (res) {
	res.send({
		success: false,
		error: 'Missing or null-value parameters'
	});
};

exports.missingParams = function (res) {
	res.send(404, 'missing_params');
};

// If a query is missing in the query list specified in the controller's
// data validation object
exports.missingQueryElement = function (res) {
	res.send({
		success: false,
		error: 'Missing or null-value query element'
	});
};

// If a value's validation tests failed
exports.validationFail = function (res) {
	res.send({
		success: false,
		error: 'Some parameter or query values failed the validation tests'
	});
};

// If no token was passed
exports.noToken = function (res) {
	res.send({
		success: false,
		error: Verbose['MISSING_TOKEN']
	});
};

// If no email was passed
exports.noEmail = function (res) {
	res.send({
		success: false,
		error: Verbose['MISSING_EMAIL']
	});
};

// If no username was passed
exports.noUsername = function (res) {
	res.send({
		success: false,
		error: Verbose['MISSING_EMAIL']
	});
};

// If tokens's format is invalid
exports.getInvalidBearerError = function () {
	return {
		success: false,
		error: 'The bearer format is invalid.'
	};
}

exports.getError = function (success, msg) {
	return {
		success: success,
		error: msg
	};
};

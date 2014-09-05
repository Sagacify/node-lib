var async = require('async');

async.choose = function (value, functions, callback) {
	// Missing value
	if (value === null) {
		throw new Error("You have to specify the preferred value.");
	}

	// Check if value is an option in functions dictionary
	var check = function (value) {
		if (!(value in functions)) {
			return false;
		}

		return true;
	};

	// If value is not found and is false (except null), then check for "false" value.
	if (!check(value)) {
		if (value) {
			return callback();
		}

		value = false;
		if (!check(value)) {
			return callback();
		}
	}

	functions[value](function () {
		if (callback) {
			callback.apply(this, arguments);
		}
	});
};

async.chainMethods = function (methodsName, args, instance, callback) {
	async.eachSeries(methodsName, function (methodsName, callback) {
		if (!instance[methodsName]) {
			return callback();
		}

		if (instance[methodsName].hasCallback()) {
			return instance[methodsName](args, callback);
		}

		instance[methodsName](args);
		callback();
	}, callback);
};
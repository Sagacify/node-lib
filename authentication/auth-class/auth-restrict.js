/**
 * Proxy `connect#use()` to apply settings to
 * mounted applications.
 *
 * @param {String|Function|Server} route
 * @param {Function|Server} fn
 * @return {app} for chaining
 * @api public
 */

var Restrict = function Restrict (strict_mode) {

	if((strict_mode != null) && (Object.isBoolean(strict_mode))) {
		this.strict_mode = strict_mode;
	}
	else {
		// return error
	}

	this.value_check = function () {

	};

	this.type_check = function () {

	};

	this.presence_check = function (expected_names, passed_names) {
		var i = expected_names.length;
		var all_match = true;
		while(i--) {
			if(passed_names.indexOf(expected_names[i]) === -1) {
				all_match = false;
				break;
			}
		}
		return all_match;
	};

	this._params = function (expected, passed) {
		var strict_mode = this.strict_mode;
		var expected_names = Object.keys(expected);
		var passed_names = Object.keys(passed);
		if(this.presence_check(expected_names, passed_names)) {

		}
		else {

		}
	};

	this._return = function () {

	};
};



module.exports = Restrict;


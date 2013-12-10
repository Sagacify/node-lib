var is = require('../strict_typing/validateType');

var SGError = require('../errorhandler/SagaError');
var SGStrictTyping = require('../strict_typing/SGStrictTyping');

module.exports = function validate (callback, args, caja, req, res, next) {
	var mixin;
	if(is.Object(mixin = req.mixin)) {
		var argsToArray = Array.apply(null, arguments);
		argsToArray.splice(0, 3);
		SGStrictTyping.apply_to_Args(mixin, args, function (error, validated_args) {
			if(error) {
				console.log('\n----- Validation Error : -----');
				console.log(error);
				return res.SGsend(new SGError('VALIDATION_FAIL', 400));
			}
			else {
				req.mixin = validated_args;
				//var newArguments = validated_args.concat(argsToArray);
				callback.apply(this, argsToArray);
			}
		});
	}
};

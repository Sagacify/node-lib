var is = require('../strict_typing/validateType');

var SGError = require('../errorhandler/SagaError');
var SGStrictTyping = require('../strict_typing/SGStrictTyping');

module.exports = function validate (callback, args, caja, req, res, next) {
	var mixin;
	if(is.Object(mixin = req.mixin)) {
		var argsToArray = Array.apply(null, arguments);
		argsToArray.splice(0, 3);
		// console.log('\n----- Mixin-1 : -----');
		// console.log(mixin);
		SGStrictTyping.apply_to_Args(mixin, args, function (error, validated_args) {
			// console.log('\n----- Mixin-2 : -----');
			// console.log(validated_args);
			// console.log('\n');
			if(error) {
				console.log('\n----- Validation Error : -----');
				console.log(error);
				return res.SGsend(new SGError('Validation', 400, 'Validation failed'));
			}
			else {
				console.log(validated_args);
				req.mixin = validated_args;
				//var newArguments = validated_args.concat(argsToArray);
				callback.apply(this, argsToArray);
			}
		});
	}
};

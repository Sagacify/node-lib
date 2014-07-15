var async = require('async');

//Callback = function(err, resultsArray)
// async.prototype.eachOrder = function(array, iterator, callback) {
	// TODO
	// var resultsArray = [];
	// async.each(array.indexes(), function(index, callback){
	// 	iterator(array[index], callback);
	// }, function(err){
	// 	if (err) {
	// 		callback(err);
	// 		return;
	// 	};
	// });
// };

async.choose = function (value, functions, callback) {
	if (!value) {
		throw new Error("You have to specify the preferred value.");
	}
	if (!(value in functions)) {
		return callback();
	}

	functions[value](function() {
		if (callback) {
			callback.apply(this, arguments);
		}
	});
};
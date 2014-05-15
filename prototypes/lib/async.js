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
	functions[value](callback);
};
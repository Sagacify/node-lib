var tty = require('tty');

var queryHistory = [];

function print_QueryAnalyze() {
	console.log(queryHistory);
	console.log('Bye bye !');
}

// function set_LeavingEventHandler () {
// 	process.openStdin().on('keypress', function (chunk, key) {
// 		if(key && (key.name === 'c') && key.ctrl) {
// 			print_QueryAnalyze();
// 			process.exit();
// 		}
// 	});

// 	process.on('exit', function () {
// 		print_QueryAnalyze();
// 		process.exit();
// 	});

// 	process.stdin.setRawMode();
// }

function set_MongoosePrototype_FindOne () {
	var _findOne = mongoose.Collection.prototype._findOne;
	var findOne = mongoose.Collection.prototype.findOne;

	mongoose.Collection.prototype._findOne = _findOne ? _findOne : findOne;

	mongoose.Collection.prototype.findOne = function find (dict, options, callback) {
		var me = this;
		this._find(function (error, cursor) {
			if(error) {
				callback(new SGError());
			}
			else {
				cursor.explain(function (error, explanation) {
					if(error) {
						callback(new SGError());
					}
					else {
						console.log('FindOne :');
						console.log(explanation);
						queryHistory.push(explanation);
						callback(null, cursor);
					}
				});
			}
		});
	};
}

function set_MongoosePrototype_Find () {
	var _find = mongoose.Collection.prototype._find;
	var find = mongoose.Collection.prototype.find;

	mongoose.Collection.prototype._find = _find ? _find : find;

	mongoose.Collection.prototype.find = function find (dict, options, callback) {
		var me = this;
		this._find(function (error, cursor) {
			if(error) {
				callback(new SGError());
			}
			else {
				cursor.explain(function (error, explanation) {
					if(error) {
						callback(new SGError());
					}
					else {
						console.log('Find :');
						console.log(explanation);
						queryHistory.push(explanation);
						callback(null, cursor);
					}
				});
			}
		});
	};
}

// module.exports = function () {
// 	if(NODE_ENV === 'development') {
// 		set_MongoosePrototype_Find();
// 		set_MongoosePrototype_FindOne();
// 	}
// };
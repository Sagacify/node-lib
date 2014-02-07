var tty = require('tty');


function print_QueryAnalyze () {

}

function setup_QueryLogSchema () {
	var QueryLogSchema = new Schema({
		response_time: [{
			type: Number
		}],
		nscannedObjects: {
			type: Number
		},
		identifier: {
			type: String
		},
		n: {
			type: Number
		},
		params: {
			type: String
		},
		fields: {
			type: String
		},
		cursor: {
			type: String
		},
		stack: {
			type: String
		}
	});
	model('QueryLog', QueryLogSchema);
}

function save_QueryLog (explanation, id, options, fields, stack) {
	model('QueryLog').update({
		identifier: id
	}, {
		$push: {
			response_time: explanation.millis
		},
		nscannedObjects: explanation.nscannedObjects,
		n: explanation.n,
		nscanned: 1,
		nscannedObjectsAllPlans: 1,
		nscannedAllPlans: 1,
		params: JSON.stringify(options),
		fields: JSON.stringify(fields),
		cursor: explanation.cursor,
		stack: stack
	}, {
		upsert: true
	}, function (e) {
		if(e) {
			console.log(e);
		}
	});
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
		var privateStack = __benchmarkOrigin;
		this._find(function (e, cursor) {
			if(e) {
				callback(new SGError(e));
			}
			else {
				cursor.explain(function (e, explanation) {
					if(e) {
						callback(new SGError(e));
					}
					else {
						callback(null, cursor);
						console.log('FindOne :');
						console.log(explanation);
						console.log(dict);
						console.log(options);
						save_QueryLog(explanation, privateStack[0], options, dict, privateStack[1]);
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
		var privateStack = __benchmarkOrigin;
		this._find(function (e, cursor) {
			if(e) {
				callback(new SGError(e));
			}
			else {
				cursor.explain(function (e, explanation) {
					if(e) {
						callback(new SGError(e));
					}
					else {
						callback(null, cursor);
						console.log('Find :');
						console.log(explanation);
						console.log(dict);
						console.log(options);
						save_QueryLog(explanation, privateStack[0], options, dict, privateStack[1]);
					}
				});
			}
		});
	};
}

module.exports = function () {
	// if(NODE_ENV === 'development') {
		// setup_QueryLogSchema();
		// set_MongoosePrototype_Find();
		// set_MongoosePrototype_FindOne();
	// }
};

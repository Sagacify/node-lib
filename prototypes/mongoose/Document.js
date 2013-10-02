var async = require('async');

mongoose.Document.prototype._toObject2 = mongoose.Document.prototype.toObject;

mongoose.Document.prototype.toObject = function(opts){
	var obj = this._toObject2(opts);
	if(opts && opts.remove){
		opts.remove.forEach(function(fieldToRemove){
			obj.deleteRecursiveField(fieldToRemove);	
		});
	}
	return obj;
};

// mongoose.Document.prototype.update = function(params, callback){
// 	var keys = [];
// 	for(var key in params)
// 		if(this[key] != params[key])
// 			keys.push(key);
// 	async.forEach(keys, function(key, callback){
// 		if(typeof this.updateValue == "function"){
// 			this.updateValue(key, params[key], callback);
// 		}
// 		else{
// 			this.set(key, params[key]);
// 			callback(null);
// 		}
// 		if(key == "tags"){
// 			params[key].forEach(function(tag){
// 				mongoose.model('Tag').getCreateTag(tag);
// 			});
// 		}
// 	}, function(err){
// 		if(!err)
// 			this.save(callback);
// 		else
// 			callback(err);
// 	});
// };

// mongoose.Document.prototype.updateDevelop = function(params, fieldsToPopulate, user, options, callback){
// 	this.update(params, function(err){
// 		if(!err){
// 			var query = mongoose.model(mongoose.modelNameFromCollectionName(this.collection.name)).findById(this._id);
// 			fieldsToPopulate.forEach(function(fieldToPopulate){
// 				query.populate(fieldToPopulate);
// 			});
// 			query.develop(fieldsToPopulate, user, options);
// 			query.exec(callback);
// 		}
// 		else
// 			callback(err);
// 	});
// };
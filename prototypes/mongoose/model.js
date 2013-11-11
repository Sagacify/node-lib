var async = require('async');

// mongoose.Model.prototype.created_at = function() {
// 	if(this.schema.tree._id.type.name == 'ObjectId')
//  		return new Date(parseInt(this._id.toString().slice(0,8), 16) * 1000);
//  	else if(this.created_at)
//  		return created_at;
//  	else
//  		return null;
// };

// mongoose.Model.get = function(path, callback){
// 	var model = this instanceof Array?this.model:this;
// 	if(typeof model[path] == "function"){
// 		if(model[path].getParamNames()[0] === "callback"){
// 			model[path](callback);
// 		}
// 		else{
// 			callback(null, model[path]());	
// 		}
// 	}
// 	else{
// 		callback(null, model[path]);
// 	}
// };

// mongoose.Model.do = function(action, params, callback){
// 	if(this.name == "model" && this[action]){
// 		this[action]._apply(this, params, callback);
// 	}
// 	else if(this instanceof Array && this.model[action]){
// 		this.model[action]._apply(this, params, callback);
// 	}
// 	else if(this instanceof Array && this.length > 0 && typeof this[0][action] == "function"){
// 		var me = this;
// 		var responses = [];
// 		async.each(this.keys(), function(docIndex, callback){
// 			this[docIndex].do(action, params, function(err, response){
// 				responses[docIndex] = response;
// 				callback(err);
// 			});
// 		}, function(err){
// 			callback(err, responses);
// 		});
// 	}
// 	else{
// 		callback(new SGError());
// 	}
// };

// mongoose.Model.prototype._get = mongoose.Model.prototype.get;

// mongoose.Model.prototype.get = function(path, options, callback){
// 	if(typeof options == "function" || callback){
// 		var callback = callback||options;
// 		if(path in this.getModel().schema.tree){
// 			callback(null, this._get(path));
// 		}
// 		else{
// 			if(this[path].hasCallback()){
// 				if(options.params){
// 					this[path]._apply(this, options.params, callback);
// 				}
// 				else{
// 					this[path](callback);
// 				}
// 			}
// 			else{
// 				if(options.params){
// 					callback(null, this[path]._apply(this, options.params));
// 				}
// 				else{
// 					callback(null, this[path]());
// 				}
// 			}
// 		}
// 	}	
// 	else{
// 		return this._get(path, options);
// 	}
// };

// mongoose.Model.prototype.do = function(action, params, callback){	
// 	if(typeof this[action] == "function" && this[action].name){
// 		if(this[action].name.startsWith("action")){
// 			this[action]._apply(this, params, callback);
// 		}
// 		else if(this[action].name.startsWith("view")){
// 			this[action+"_add"]._apply(this, params, callback);
// 		}
// 		else{
// 			callback(new SGError());
// 		}
// 	}
// 	else{
// 		callback(new SGError());
// 	}
// };

// mongoose.Model.prototype._set = mongoose.Model.prototype.set;

// mongoose.Model.prototype.set = function set(path, val, type, options, callback){
// 	if(path && path.isObject()){
// 		var me = this;
// 		if(!callback && typeof val == "function")
// 			callback = val;
// 		async.each(path.keys(), function(key, callback){
// 			me.set(key, path[key], null, null, callback);
// 		}, function(err){
// 			if(callback)
// 				callback(err);
// 		});
// 	}
// 	else{
// 		var setterName = "set"+path.capitalize();
// 		if(typeof this[setterName] == "function" && set.caller != this[setterName]){
// 			if(this[setterName].hasCallback() && callback){
// 				this[setterName](val, callback);	
// 			}
// 			else{
// 				this[setterName](val);
// 				if(callback)
// 					callback();
// 			}
// 		}
// 		else if(this.getModel().schema.tree._get(path) && this.getModel().schema.tree._get(path)._id){
// 			this.setSemiEmbedded(path, val, callback);
// 		}
// 		else{
// 			this._set.apply(this, arguments);
// 			if(callback)
// 				callback();
// 		}
// 	}
// },

// mongoose.Model.prototype.isSemiEmbedded = function(path){
// 	var schema = this.getModel().schema.tree._get(path);
// 	return schema&&schema._id&&schema._id.ref;
// };

// mongoose.Model.prototype.isSemiEmbeddedArray = function(path){
// 	var schema = this.getModel().schema.tree._get(path+'.0');
// 	return schema&&schema._id&&schema._id.ref;
// };

// mongoose.Model.prototype.isRef = function(path){
// 	var schema = this.getModel().schema.tree._get(path);
// 	return schema&&schema.ref;
// };

// mongoose.Model.prototype.isRefArray = function(path){
// 	var schema = this.getModel().schema.tree._get(path)[0];
// 	return schema&&schema.ref;
// };

// mongoose.Model.prototype.getRef = function(path){
// 	var schema = this.getModel().schema.tree._get(path)[0];
// 	return schema.ref;
// };

mongoose.Model.prototype.getModel = function(){
	return mongoose.models[this.getModelName()];
};

mongoose.Model.prototype.getModelName = function(){
	return mongoose.modelNameFromCollectionName(this.collection.name);
};

// mongoose.Model.prototype.setSemiEmbedded = function(path, val, callback){
// 	var me = this;
// 	var set = function(doc){
// 		me.getModel().schema.tree._get(path).keys().forEach(function(key){
// 			me.set(path+"."+key, doc[key]);
// 		});
// 	}

// 	if(val instanceof Object){
// 		set(val);
// 		if(callback)
// 			callback(null);
// 	}
// 	else{
// 		model(this.getModel().schema.tree._get(path)._id.ref).findById(val, function(err, doc){
// 			if(doc){
// 				set(doc);
// 			}
// 			if(callback)
// 				callback(err);
// 		});
// 	}
// };

// mongoose.Model.prototype.add = function(path, val, callback){
// 	if(this.isSemiEmbeddedArray(path)){
// 		this.get(path).addSemiEmbedded(val, callback);
// 	}
// 	else if(this.isRefArray(path)){
// 		this.addInRefArray(path, val, callback);
// 	}
// 	else{
// 		this.get(path).push(val);
// 		if(callback)
// 			callback(null, this.get(path).last());
// 	}
// };

// mongoose.Model.prototype.addInRefArray = function(path, val, callback){
// 	if(val && val._id){
// 		this.get(path).push(val._id);
// 		callback(null, val);
// 	}
// 	else if(val && val.isObject()){
// 		var me = this;
// 		model(this.getModel().schema.tree._get(path)[0].ref).create(val, function(err, doc){
// 			if(doc){
// 				me.get(path).push(doc._id);
// 			}
// 			if(callback)
// 				callback(err, doc);
// 		});
// 	}
// 	else{
// 		this.get(path).push(val);
// 		callback(null, val);
// 	}
// };

// mongoose.Model.prototype.sgUpdate = function(args, callback){
// 	var me = this;
// 	this.set(args, function(err){
// 		if(!err){
// 			me.save(function(err){
// 				callback(err, me);
// 			});
// 		}
// 		else{
// 			callback(err);
// 		}
// 	});
// };

// mongoose.Model.sgUpdate = function(args, callback){
// 	var me = this;
// 	async.each(this, function(doc, callback){
// 		doc.sgUpdate(args, callback);
// 	}, function(err){
// 		callback(err, me);
// 	});
// };

// //mongoose.Model.prototype.sgRemove = mongoose.Model.prototype.remove;

// mongoose.Model.sgRemove = function(item){
// 	if(typeof item == "function"){
// 		var callback = item;
// 		async.each(this, function(doc, callback){
// 			doc.remove(callback);
// 		}, function(err){
// 			callback(err);
// 		});
// 	}
// 	else{
// 		for(var i = this.length-1; i >= 0; i--){
// 			if((this[i] && this[i] instanceof mongoose.Types.ObjectId && this[i].equals(item)) || (item && item instanceof mongoose.Types.ObjectId && item.equals(this[i])) || (this[i] == item)){
// 				this.splice(i, 1);
// 			}
// 		}
// 	}
// };

mongoose.Model.prototype._save = mongoose.Model.prototype.save;

mongoose.Model.prototype.save = function save(fn){
	if(this.modifiedPaths().length==0){
		fn(null);
	}
	else{
		return this._save.apply(this, arguments);
	}
};

mongoose.Model.prototype._remove = mongoose.Model.prototype.remove;

// mongoose.Model.prototype.remove = function(){
// 	this.ensureRemoveConsistency();
// 	return this._remove.apply(this, arguments);
// };

mongoose.Model.prototype.ensureRemoveConsistency = function(){
	var me = this;
	var myModelName = this.getModelName();
	mongoose.models.keys().forEach(function(modelName){
		var skelleton = mongoose.models[modelName].schema.skelleton;
		if(skelleton[myModelName]){
			skelleton[myModelName].forEach(function(path){
				var findArgs = {};
				findArgs[path] = me._id;
				model(modelName).find(findArgs, function(err, docs){
					if(docs){
						docs.forEach(function(doc){
							if(path.endsWith('._id')){
								var semiEmbeddedPath = path.substring(0, path.length-4);
								if(doc.isSemiEmbedded(semiEmbeddedPath)){
									doc.set(semiEmbeddedPath, null);
									doc.save();
								}
								else if(doc.isSemiEmbeddedArray(semiEmbeddedPath)){
									doc.get(semiEmbeddedPath).remove(me._id);
									doc.save();
								}
							}
							else if(doc.isRef(path)){
								doc.set(path, null);
								doc.save();
							}
							else if(doc.isRefArray(path)){
								doc.get(path).remove(me._id);
								doc.save();
							}
						});
					}
				});
			});
			model(modelName).find()
		}
	});
};

mongoose.Model.prototype.willRemove = function(){

};

// mongoose.Model.prototype.sgRemove = function(callback){
// 	if(!this.will('remove', null, null, callback)){
// 		return;
// 	}

// 	var post = this.did('remove', null, null, callback);

// 	this.remove(post);
// };
mongoose.Model.prototype.doRemove = function(){
	this.ensureRemoveConsistency();
   	return this._remove.apply(this, arguments);
}

mongoose.Model.prototype.didRemove = function(){

};

// mongoose.Model.willCreate = function(){

// };

// mongoose.Model.sgCreate = function(doc, callback){
// 	if(!mongoose.Document.prototype.will.apply(this, ['create', null, doc, callback])){
// 		return;
// 	}

// 	var post = mongoose.Document.prototype.did.apply(this, ['create', null, doc, callback]);

// 	var model = this;
// 	var doc = new model(doc);

// 	Object.defineProperty(doc, "context", {
// 		writable: true,
// 		value: this.context
// 	});

// 	var err = doc.willCreate();
// 	if(err){
// 		return callback(err);
// 	}
	
// 	doc.save(function(err){
// 		doc.didCreate();
// 		post(err, doc);
// 	});
// };

// mongoose.Model.didCreate = function(){

// };

mongoose.Model.sgCreate = function(raw, callback){
	var model = this;
	var doc = new model();

	Object.defineProperty(doc, "context", {
		writable: true,
		value: this.context
	});

	doc.sgUpdate(raw, callback);
};


mongoose.Model.get = function(filter, sort, paginate, callback){
	if(this instanceof Array){
		if(filter){
			var processedArray = this.filter(function(item){
				var keep = true;
				filter.keys().forEach(function(key){
					if(item[key] != filter[key])
						keep = false;
				});
				return keep;
			});
		}

		var sortKeys = sort.keys();
		if(sortKeys.length > 0){
			var sort_by = sortKeys[0];
			processedArray = processedArray.sort(function(item1, item2){
				if(item1[sort_by] && !item2[sort_by]){
					return 1;
				}
				else if(!item1[sort_by] && item2[sort_by]){
					return -1;
				}
				else if(typeof item1[sort_by] == "string" && typeof item2[sort_by] == "string"){
					return item1.localCompare(item2);
				}
				else if(typeof item1[sort_by] == "number" && typeof item2[sort_by] == "number"){
					return item2-item1;
				}
				else{
					return 0;
				}
			});
		}

		if(paginate.offset || paginate.limit){
			var start = paginate.offset||0;
			var end = (paginate.limit||processedArray.length)-start;
			processedArray = processedArray.slice(start, end);
		}

		callback(null, processedArray);
	}
	else if(this.name == "model"){
		//work around
		if (!paginate) {
			this.find(filter).sort(sort).exec(callback);
		} else {
			this.find(filter).sort(sort).paginate(paginate).exec(callback);	
		}
		
	}
	else{
		callback(new SGError());
	}
};
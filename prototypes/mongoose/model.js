var async = require('async');

mongoose.Model.prototype.getModel = function(){
	return mongoose.models[this.getModelName()];
};

mongoose.Model.prototype.getModelName = function(){
	return mongoose.modelNameFromCollectionName(this.collection.name);
};

mongoose.Model.prototype._save = mongoose.Model.prototype.save;

mongoose.Model.prototype.save = function save(fn){
	if(this.modifiedPaths().length==0 && !this.isNew){
		if(fn)
			fn(null, this);
	}
	else{
		return this._save.apply(this, arguments);
	}
};

mongoose.Model.prototype.sgSave = function(callback){
	var me = this;
	this.save(function(err){
		callback(err);
		if(!err){
			me.ensureUpdateConsistency();
		}
	});
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
};

mongoose.Model.prototype.didRemove = function(){

};

mongoose.Model.willFindById = function(id){

};

mongoose.Model.sgFindById = function(id, callback){
	var me = this;
	var find = function(){
		me.findById(id, function(err, doc){
			if(!err){
				if(doc){
					doc.setHidden('context', me.context);
					me.didFindById(doc);
					callback(null, doc);
				}
				else {
					console.log('Bad _id?');
					callback(new SGError('NO_RESULT'));
				}
			}
			else {
				callback(err);
			}
		});
	};
	if(!this.willFindById.hasCallback()) {
		var willRes = this.willFindById(id);
		if(willRes instanceof Error||willRes instanceof SGError){
			callback(willRes);
			return;
		}
		find();
	}
	else{
		this.willFindById(id, function(err){
			if(!err){
				find();
			}
			else{
				callback(err);
			}
		});
	}
};

mongoose.Model.didFindById = function(doc){

};

mongoose.Document.prototype.willCreate = function(args, callback){
	return this.willUpdate(args, callback);
};

mongoose.Document.prototype.doCreate = function(args, callback){
	this.doUpdate(args, callback);
};

mongoose.Document.prototype.didCreate = function(args){
	this.didUpdate(args);
};

mongoose.Model.sgCreate = function(raw, callback){
	var model = this;
	var doc = new model();

	doc.setHidden('context', this.context);

	//auto set logged user
	for(var path in this.schema.paths){
		if(this.schema.paths[path].options.loggedUser){
			if(path.endsWith('._id')){
				var userPath = path.substring(0, path.length-4);
				raw[userPath] = this.context.user;
			}
			else{
				raw[path] = this.context.user._id;
			}
		}
	}
	doc.sgCreate(raw, callback);
};

mongoose.Model.get = function(path, args, callback){
	var getterPath = "get"+path.capitalize();
	if(typeof this[getterPath] == "function"){
		this[getterPath]._apply(this, args, callback);
	}
	else{
		callback(new SGError());
	}
};

mongoose.Model.getRoot = function(filter, sort, paginate, callback){
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
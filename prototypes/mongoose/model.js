var async = require('async');

mongoose.Model.prototype.created_at = function() {
	if(this.schema.tree._id.type.name == 'ObjectId')
 		return new Date(parseInt(this._id.toString().slice(0,8), 16) * 1000);
 	else if(this.created_at)
 		return created_at;
 	else
 		return null;
};

mongoose.Model.get = function(path, callback){
	var model = this instanceof Array?this.model:this;
	if(typeof model[path] == "function"){
		if(model[path].getParamNames()[0] === "callback"){
			model[path](callback);
		}
		else{
			callback(null, model[path]());	
		}
	}
	else{
		callback(null, model[path]);
	}
};

mongoose.Model.do = function(action, params, callback){
	if(this.name == "model" && this[action]){
		this[action]._apply(this, params, callback);
	}
	else if(this instanceof Array && this.model[action]){
		this.model[action]._apply(this, params, callback);
	}
	else if(this instanceof Array && this.length > 0 && typeof this[0][action] == "function"){
		var me = this;
		var responses = [];
		async.each(this.keys(), function(docIndex, callback){
			this[docIndex].do(action, params, function(err, response){
				responses[docIndex] = response;
				callback(err);
			});
		}, function(err){
			callback(err, responses);
		});
	}
	else{
		callback(new SGError());
	}
};

mongoose.Model.prototype._get = mongoose.Model.prototype.get;

mongoose.Model.prototype.get = function(path, options){
	if(typeof options == "function"){
		var callback = options;
		if(path in this.getModel().schema.tree){
			callback(null, this._get(path));
		}
		else{
			if(this[path].getParamNames()[0] === "callback"){
				this[path](callback);
			}
			else{
				callback(null, this[path]());	
			}
		}
	}	
	else{
		return this._get(path, options);
	}
};

mongoose.Model.prototype.do = function(action, params, callback){
	this[action]._apply(this, params, callback);
};

mongoose.Model.prototype._set = mongoose.Model.prototype.set;

mongoose.Model.prototype.set = function set(path, val, type, options, callback){
	if(path && path.isObject()){
		var me = this;
		if(!callback && typeof val == "function")
			callback = val;
		async.each(path.keys(), function(key, callback){
			me.set(key, path[key], null, null, callback);
		}, function(err){
			if(callback)
				callback(err);
		});
	}
	else{
		var setterName = "set"+path.capitalize();
		if(typeof this[setterName] == "function" && set.caller != this[setterName]){
			if(this[setterName].hasCallback() && callback){
				this[setterName](val, callback);	
			}
			else{
				this[setterName](val);
				if(callback)
					callback();
			}
		}
		else if(this.getModel().schema.tree._get(path)._id){
			this.setSemiEmbedded(path, val, callback);
		}
		else{
			this._set.apply(this, arguments);
			if(callback)
				callback();
		}
	}
},

mongoose.Model.prototype.setSemiEmbedded = function(path, val, callback){
	var me = this;
	var set = function(doc){
		me.getModel().schema.tree._get(path).keys().forEach(function(key){
			me.set(path+"."+key, doc[key]);
		});
	}

	if(val instanceof Object){
		set(val);
		if(callback)
			callback(null);
	}
	else{
		model(this.getModel().schema.tree._get(path)._id.ref).findById(val, function(err, doc){
			if(doc){
				set(doc);
			}
			if(callback)
				callback(err);
		});
	}
};

mongoose.Model.prototype.sgUpdate = function(args, callback){
	var me = this;
	this.set(args, function(err){
		if(!err){
			me.save(function(err){
				callback(err, me);
			});
		}
		else{
			callback(err);
		}
	});
};

mongoose.Model.sgUpdate = function(callback){
	var me = this;
	async.each(this, function(doc, callback){
		doc.sgUpdate(callback);
	}, function(err){
		callback(err, me);
	});
};

mongoose.Model.prototype.sgRemove = mongoose.Model.prototype.remove;

mongoose.Model.sgRemove = function(item){
	if(typeof item == "function"){
		var callback = item;
		async.each(this, function(doc, callback){
			doc.remove(callback);
		}, function(err){
			callback(err);
		});
	}
	else{
		for(var i = this.length-1; i >= 0; i--){
			if((this[i] && this[i] instanceof mongoose.Types.ObjectId && this[i].equals(item)) || (item && item instanceof mongoose.Types.ObjectId && item.equals(this[i])) || (this[i] == item)){
				this.splice(i, 1);
			}
		}
	}
};

mongoose.Model.process = function(filter, sort, paginate, callback){
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

		if(sort){
			processedArray = processedArray.sort(function(item1, item2){
				if(item1[sort] && !item2[sort]){
					return 1;
				}
				else if(!item1[sort] && item2[sort]){
					return -1;
				}
				else if(typeof item1[sort] == "string" && typeof item2[sort] == "string"){
					return item1.localCompare(item2);
				}
				else if(typeof item1[sort] == "number" && typeof item2[sort] == "number"){
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
		this.find(filter).sort(sort).skip(paginate.offset).limit(paginate.limit).exec(callback);
	}
	else{
		callback(new SGError());
	}
};
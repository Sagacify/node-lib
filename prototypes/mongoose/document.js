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

var async = require('async');

mongoose.Document.prototype.created_at = function() {
	if(this.schema.tree._id.type.name == 'ObjectId')
 		return new Date(parseInt(this._id.toString().slice(0,8), 16) * 1000);
 	else if(this.created_at)
 		return created_at;
 	else
 		return null;
};

mongoose.Document.prototype._get = mongoose.Document.prototype.get;

mongoose.Document.prototype.get = function(path, options, callback){
	if(typeof options == "function" || callback){
		var callback = callback||options;
		if(path in this.schema.tree){
			callback(null, this._get(path));
		}
		else{
			if(this[path].hasCallback()){
				if(options.params){
					this[path]._apply(this, options.params, callback);
				}
				else{
					this[path](callback);
				}
			}
			else{
				if(options.params){
					callback(null, this[path]._apply(this, options.params));
				}
				else{
					callback(null, this[path]());
				}
			}
		}
	}	
	else{
		return this._get(path, options);
	}
};

mongoose.Document.prototype.do = function(action, params, callback){	
	if(typeof this[action] == "function" && this[action].name){
		if(this[action].name.startsWith("action")){
			this[action]._apply(this, params, callback);
		}
		else if(this[action].name.startsWith("view")){
			this[action+"_add"]._apply(this, params, callback);
		}
		else{
			callback(new SGError());
		}
	}
	else{
		callback(new SGError());
	}
};

mongoose.Document.prototype._set = mongoose.Document.prototype.set;

mongoose.Document.prototype.set = function set(path, val, type, options, callback){
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
		else if(this.schema.tree._get(path) && this.schema.tree._get(path)._id){
			this.setSemiEmbedded(path, val, callback);
		}
		else{
			this._set.apply(this, arguments);
			if(callback)
				callback();
		}
	}
},

mongoose.Document.prototype.isSemiEmbedded = function(path){
	var schema = this.schema.tree._get(path);
	return schema&&schema._id&&schema._id.ref;
};

mongoose.Document.prototype.isSemiEmbeddedArray = function(path){
	var schema = this.schema.tree._get(path+'.0');
	return schema&&schema._id&&schema._id.ref;
};

mongoose.Document.prototype.isRef = function(path){
	var schema = this.schema.tree._get(path);
	return schema&&schema.ref;
};

mongoose.Document.prototype.isRefArray = function(path){
	var schema = this.schema.tree._get(path)[0];
	return schema&&schema.ref;
};

mongoose.Document.prototype.getRef = function(path){
	var schema = this.schema.tree._get(path)[0];
	return schema.ref;
};

mongoose.Document.prototype.setSemiEmbedded = function(path, val, callback){
	var me = this;
	var set = function(doc){
		me.schema.tree._get(path).keys().forEach(function(key){
			me.set(path+"."+key, doc[key]);
		});
	}

	if(val instanceof Object){
		set(val);
		if(callback)
			callback(null);
	}
	else{
		model(this.schema.tree._get(path)._id.ref).findById(val, function(err, doc){
			if(doc){
				set(doc);
			}
			if(callback)
				callback(err);
		});
	}
};

mongoose.Document.prototype.add = function(path, val, callback){
	if(this.isSemiEmbeddedArray(path)){
		this.get(path).addSemiEmbedded(val, callback);
	}
	else if(this.isRefArray(path)){
		this.addInRefArray(path, val, callback);
	}
	else{
		this.get(path).push(val);
		if(callback)
			callback(null, this.get(path).last());
	}
};

mongoose.Document.prototype.addInRefArray = function(path, val, callback){
	if(val && val._id){
		this.get(path).push(val._id);
		callback(null, val);
	}
	else if(val && val.isObject()){
		var me = this;
		model(this.schema.tree._get(path)[0].ref).create(val, function(err, doc){
			if(doc){
				me.get(path).push(doc._id);
			}
			if(callback)
				callback(err, doc);
		});
	}
	else{
		this.get(path).push(val);
		callback(null, val);
	}
};

mongoose.Document.prototype.sgUpdate = function(args, callback){
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

mongoose.Document.prototype.sgRemove = mongoose.Model.prototype.remove;
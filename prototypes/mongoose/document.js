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

mongoose.Document.prototype.will = function(meth, path, args, callback){
	var willMeth = "will"+meth.capitalize();
	if(path){
		var methPath = meth.endsWith('Array')?meth.replace('Array', path.capitalize()):meth+path.capitalize();
		var willMethPath = "will"+methPath.capitalize();
	}
	else{
		var willMethPath = willMeth;
	}
	var willRes = typeof this[willMethPath] == "function"?this[willMethPath](args):this[willMeth](path, args);
	if(willRes instanceof Error || willRes instanceof SGError){
		if(callback)
			callback(willRes);
		return false;
	}
	else{
		return true;
	}
};

mongoose.Document.prototype.did = function(meth, path, args, callback){
	var didMeth = "did"+meth.capitalize();
	if(path){
		var methPath = meth.endsWith('Array')?meth.replace('Array', path.capitalize()):meth+path.capitalize();
		var didMethPath = "did"+methPath.capitalize();
	}
	else{
		var didMethPath = didMethPath;
	}
	var me = this;
	return function(err, result){
		if(!err){
			typeof me[didMethPath] == "function"?me[didMethPath](args):me[didMeth](path, args);
		}
		if(callback)
			callback(null, result);
		else
			return result;
	};
};

mongoose.Document.prototype._get = mongoose.Document.prototype.get;

// mongoose.Document.prototype.get = function(path, params, callback){
// 	if(typeof params == "function"){
// 		callback = params;
// 		params = {};
// 	}

// 	if(!callback){
// 		var willRes = this.willGet(path, params);
// 		if(willRes instanceof Error || willRes instanceof SGError){
// 			return willRes;
// 		}
// 		var val = this.doGet(path, params);
// 		this.didGet(path, params);
// 		return val;
// 	}
// 	else{
// 		var me = this;
// 		this.willGet(path, params, function(err){
// 			if(!err){
// 				me.doGet(path, params, function(err, res){
// 					if(!err){
// 						me.didGet(path, params);
// 					}
// 					callback(err, res);
// 				})
// 			}
// 			else{
// 				callback(err);
// 			}
// 		});
// 	}
// };

mongoose.Document.prototype.willGet = function(path, params, callback){
	if(typeof this["willGet"+path.capitalize()] == "function"){
		return this["willGet"+path.capitalize()]._apply(this, params, callback);
	}
	else{
		return callback?callback(null):null;
	}
};

mongoose.Document.prototype.doGet = function(path, params, callback){
	if(typeof params == "function"){
		callback = params;
	}
    var getPath = "get"+path.capitalize();
    if(typeof this[getPath] == "function"){
        return this[getPath]._apply(this, params, callback);
    }
    else{
    	var val = this._get(path);
    	if(callback){
    		callback(null, val);
    	}
    	else{
    		return val;
    	}
    }
};

// mongoose.Document.prototype.get = function(path, options, callback){
// 	if(typeof options == "function"){
// 		callback = options;
// 		options = {};
// 	}
// 	options = options||{};

// 	var getPath = "get"+path.capitalize();

// 	if(!this.will('get', path, options.params, callback)){
// 		return;
// 	}

// 	var me = this;
// 	var post = this.did('get', path, options.params, callback);

// 	if(typeof this[getPath] == "function"){
// 		if(callback)
// 			this[getPath]._apply(this, options.params, post);
// 		else
// 			return post(null, this[getPath]._apply(this, options.params))
// 	}
// 	else{
// 		return post(null, this._get(path, options));
// 	}
// };

mongoose.Document.prototype.didGet = function(path, params){
	if(typeof this["didGet"+path.capitalize()] == "function")
		return this["didGet"+path.capitalize()]._apply(this, params);
};

mongoose.Document.prototype.willDo = function(action, params, callback){
	if(typeof this["will"+action.capitalize()] == "function"){
		return this["will"+action.capitalize()]._apply(this, params, callback);
	}
	else{
		return callback?callback(null):null;
	}
};

// mongoose.Document.prototype.do = function(action, params, callback){
// 	var willDoPath = "will"+action.capitalize();

// 	if(!this.will('do', action, params, callback)){
// 		return;
// 	}

// 	var post = this.did('do', action, params, callback);

// 	if(typeof this[action] == "function" && this.schema.documentActions[action]){
// 		if(callback)
// 			this[action]._apply(this, params, post);
// 		else
// 			return post(null, this[action]._apply(this, params));
// 	}
// 	else{
// 		callback(new SGError());
// 	}
// };

mongoose.Document.prototype.doDo = function(action, params, callback){
	if(typeof this[action] == "function" && this.schema.documentActions[action]){
		this[action]._apply(this, params, callback);
    }
    else{
		callback(new SGError());
    }
};

mongoose.Document.prototype.didDo = function(action, params){
	if(typeof this["did"+action.capitalize()] == "function")
		return this["did"+action.capitalize()]._apply(this, params);
};

mongoose.Document.prototype.willSet = function(path, val, callback){
	if(typeof path == "string" && typeof this["willSet"+path.capitalize()] == "function"){
		var args = {};
		args[path] = val;
		return this["willSet"+path.capitalize()]._apply(this, args, callback);
	}
	else{
		return callback?callback(null):null;
	}
};

mongoose.Document.prototype._set = mongoose.Document.prototype.set;

// mongoose.Document.prototype.set = function set(path, val, type, options, callback){
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
// 		var setPath = "set"+path.capitalize();

// 		if(typeof this[setPath] == "function" && set.caller != this[setPath]){
// 			if(this[setPath].hasCallback() && callback){
// 				this[setPath](val, callback);	
// 			}
// 			else{
// 				this[setPath](val);
// 				if(callback)
// 					callback();
// 			}
// 		}
// 		else {
// 			if(!this.will('set', path, val, callback)){
// 				return;
// 			}

// 			var post = this.did('set', path, val, callback);

// 			if(this.schema.tree._get(path) && this.schema.tree._get(path)._id){
// 				this.setSemiEmbedded(path, val, post);
// 			}
// 			else{
// 				this._set.apply(this, arguments);
// 				post();
// 			}
// 		}
// 	}
// },

mongoose.Document.prototype.doSet = function(path, val, type, options, callback){
	console.log("doSet")
	console.log(path)
	console.log(val)
	if(!callback && typeof type == "function")
		callback = type;
	if(path && path.isObject()){
		var me = this;
		if(!callback && typeof val == "function")
			callback = val;
		async.each(path.keys(), function(key, callback){
			me.set(key, path[key], callback);
		}, function(err){
			if(callback)
				callback(err);
		});
	}
	else{
		var setterName = "set"+path.capitalize();
		if(typeof this[setterName] == "function" && arguments.callee.caller.caller != this[setterName]){
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

mongoose.Document.prototype.didSet = function(path, val){
	if(typeof path == "string" && typeof this["didSet"+path.capitalize()] == "function")
		return this["didSet"+path.capitalize()]._apply(this, {val:val});
};

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

mongoose.Document.prototype.willAddInArray = function(path, val, callback){
	var willAddPath = "willAddIn"+path.capitalize();
	if(typeof this[willAddPath] == "function"){
		if(this[willAddPath].hasCallback()){
			this[willAddPath](val, callback);
		}
		else{
			var willRes = this[willAddPath](val);
			if(callback){
				if(willRes instanceof Error||willRes instanceof SGError)
					callback(willRes);
				else
					callback(null, willRes)
			}
			else{
				callback(willRes);
			}
		}
	}
	else{
		return callback?callback(null):null;
	}
};

mongoose.Document.prototype.doAddInArray = function(path, val, callback){
	var addPath = "addIn"+path.capitalize();
	if(typeof this[addPath] == "function"){
		if(this[addPath].hasCallback()){
			this[addPath](val, callback);
		}
		else{
			this[addPath](val);
			if(callback)
				callback(null);
		}
	}
	else if(this.isSemiEmbeddedArray(path)){
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

// mongoose.Document.prototype.addInArray = function(path, val, callback){
// 	if(!this.will('addInArray', path, val, callback)){
// 		return;
// 	}

// 	var post = this.did('addInArray', path, val, callback);

// 	var addPath = "addIn"+path.capitalize();
// 	if(typeof this[addPath] == "function"){
// 		if(this[addPath].hasCallback()){
// 			this[addPath](val, post);
// 		}
// 		else{
// 			this[addPath](val);
// 			post(null);
// 		}
// 	}
// 	else if(this.isSemiEmbeddedArray(path)){
// 		this.get(path).addSemiEmbedded(val, post);
// 	}
// 	else if(this.isRefArray(path)){
// 		this.addInRefArray(path, val, post);
// 	}
// 	else{
// 		this.get(path).push(val);
// 		post(null, this.get(path).last());
// 	}
// };

mongoose.Document.prototype.didAddInArray = function(path, val){
	if(typeof path == "string" && typeof this["didAddIn"+path.capitalize()] == "function")
		return this["didAddIn"+path.capitalize()](this, val);
};

mongoose.Document.prototype.willRemoveFromArray = function(path, val, callback){
	var willRemovePath = "willRemoveFrom"+path.capitalize();
	if(typeof this[willRemovePath] == "function"){
		if(this[willRemovePath].hasCallback()){
			this[willRemovePath](val, callback);
		}
		else{
			var willRes = this[willRemovePath](val);
			if(callback){
				if(willRes instanceof Error||willRes instanceof SGError)
					callback(willRes);
				else
					callback(null, willRes)
			}
			else{
				callback(willRes);
			}
		}
	}
	else{
		return callback?callback(null):null;
	}
};

mongoose.Document.prototype.doRemoveFromArray = function(path, val, callback){
	var removePath = "removeFrom"+path.capitalize();

	var me = this;

	if(typeof this[removePath] == "function"){
	    if(this[removePath].hasCallback()){
	    	this[removePath](val, callback);
	    }
	    else{
            this[removePath](val);
            if(callback)
            	callback(null);
	    }
	}
	else if(val instanceof mongoose.Document){
        val.remove();
        callback(null);
	}
	else{
        this.get(path).sgRemove(val);
        callback(null);
	}
};

// mongoose.Document.prototype.removeFromArray = function(path, val, callback){
// 	if(!this.will('removeFromArray', path, val, callback)){
// 		return;
// 	}

// 	var post = this.did('removeFromArray', path, val, callback);

// 	var removePath = "removeFrom"+path.capitalize();

// 	var me = this;
// 	if(typeof this[removePath] == "function"){
// 		if(this[removePath].hasCallback()){
// 			this[removePath](val, post);
// 		}
// 		else{
// 			this[removePath](val);
// 			post(null);
// 		}
// 	}
// 	else if(val instanceof mongoose.Document){
// 		val.remove();
// 		post(null);
// 	}
// 	else{
// 		this.get(path).sgRemove(val);
// 		post(null);
// 	}
// };

mongoose.Document.prototype.didRemoveFromArray = function(path, val){
	if(typeof path == "string" && typeof this["didRemoveFrom"+path.capitalize()] == "function")
		return this["didRemoveFrom"+path.capitalize()](this, val);
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

mongoose.Document.prototype.willUpdate = function(args){
	
};

// mongoose.Document.prototype.sgUpdate = function(args, callback){
// 	if(!this.will('update', null, args, callback)){
// 		return;
// 	}

// 	var post = this.did('update', null, args, callback);

// 	var me = this;
// 	this.set(args, function(err){
// 		if(!err){
// 			//me.ensureUpdateConsistency();
// 			me.save(function(err){
// 				post(err, me);
// 			});
// 		}
// 		else{
// 			post(err);
// 		}
// 	});
// };

mongoose.Document.prototype.doUpdate = function(args, callback){
	var me = this;
	this.set(args, function(err){
	    if(!err){
	        //me.ensureUpdateConsistency();
			me.save(function(err){
				callback(err, me);
			});
	    }
		else{
			callback(err);
	    }
	});
};

mongoose.Document.prototype.didUpdate = function(args){
	
};

mongoose.Document.prototype.willCreate = function(){

};


mongoose.Document.prototype.didCreate = function(){

};

mongoose.Document.prototype.ensureUpdateConsistency = function(){
	var me = this;
	if(this.getModelName){
		var myModelName = this.getModelName();
		mongoose.models.keys().forEach(function(modelName){
			var skelleton = mongoose.models[modelName].schema.skelleton;
			if(skelleton[myModelName]){
				skelleton[myModelName].forEach(function(path){
					if(path.endsWith('._id')){
						var findArgs = {};
						findArgs[path] = me._id;
						model(modelName).find(findArgs, function(err, docs){
							if(docs){
								docs.forEach(function(doc){
									var semiEmbeddedPath = path.substring(0, path.length-4);
									var semiEmbeddedDoc;
									if(doc.isSemiEmbedded(semiEmbeddedPath)){
										semiEmbeddedDoc = doc.get(semiEmbeddedPath);
									}
									else if(doc.isSemiEmbeddedArray(semiEmbeddedPath)){
										semiEmbeddedDoc = doc.get(semiEmbeddedPath).remove(me._id);
									}
									if(semiEmbeddedDoc){
										var changed = false;
										me.keys().forEach(function(key){
											if(me[key] != semiEmbeddedDoc[key]){
												semiEmbeddedDoc[key] = me[key];
												changed = true;
											}
											if(changed){
												doc.save();
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	}
}


var generateMeth = function(meth){
	var Meth = meth.capitalize();
	var willMeth = "will"+Meth;
	var doMeth = "do"+Meth;
	var didMeth = "did"+Meth;
	if(meth == "update" || meth == "remove"){
		meth = "sg"+meth.capitalize();
	}
	var Class = meth=="sgRemove"?mongoose.Model:mongoose.Document;
	Class.prototype[meth] = function(path, args, callback){
		if(typeof args == "function"){
			callback = args;
			args = {};
		}

		if(!callback){
			var willRes = this[willMeth](path, args);
			if(willRes instanceof Error || willRes instanceof SGError){
				return willRes;
			}
			var val = this[doMeth](path, args);
			this[didMeth](path, args);
			return val;
		}
		else{
			if(meth == "sgUpdate"){
				args = null;
			}
			if(meth == "sgRemove"){
				path = null;
				args = null;
			}
			var me = this;
			var doCallback = function(err, res){
				if(!err){
					me[didMeth](path, args);
				}
				callback(err, res);
			}
			var willCallback = function(err){
				if(!err){
					me[doMeth](path||doCallback, args||doCallback, doCallback);
				}
				else{
					callback(err);
				}
			}
			this[willMeth](path||willCallback, args||willCallback, willCallback);
		}
	};
};

['get', 'set', 'do', 'addInArray', 'removeFromArray', 'update', 'remove'].forEach(function(meth){
	generateMeth(meth);
});
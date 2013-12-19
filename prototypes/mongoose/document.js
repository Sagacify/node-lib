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

mongoose.Document.prototype.created_at = function() {
	if(this.schema.tree._id.type.name == 'ObjectId')
 		return new Date(parseInt(this._id.toString().slice(0,8), 16) * 1000);
 	else if(this.created_at)
 		return created_at;
 	else
 		return null;
};

mongoose.Document.prototype.didDo = function(action, params){
	if(typeof this["did"+action.capitalize()] == "function")
		return this["did"+action.capitalize()]._apply(this, params);
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

mongoose.Document.prototype._get = mongoose.Document.prototype.get;

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

mongoose.Document.prototype.didGet = function(path, params){
	if(typeof this["didGet"+path.capitalize()] == "function")
		return this["didGet"+path.capitalize()]._apply(this, params);
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

mongoose.Document.prototype.doSet = function(path, val, type, options, callback){
	if(arguments.callee.caller.caller == this._set){
		return this._set.apply(this, arguments);
	}
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
		if(typeof this[setterName] == "function" && arguments.callee.caller.caller.caller != this[setterName]){
			if(this[setterName].hasCallback() && callback){
				this[setterName](val, callback);	
			}
			else{
				this[setterName](val);
				if(callback) {
					callback()
				}
			}
		}
		else if(this.schema.tree._get(path) && this.schema.tree._get(path)._id){
			this.setSemiEmbedded(path, val, callback);
		}
		else if(this.schema.tree._get(path) && this.schema.tree._get(path).ref == 'File' && this.schema.tree._get(path).base64){
			this.setBase64File(path, val, callback);
		}
		else if(this.schema.tree._get(path) instanceof Array && this.schema.tree._get(path)[0].ref == 'File' && this.schema.tree._get(path)[0].base64){
			this.setBase64Files(path, val, callback);
		}
		else{
			//this._set.apply(this, arguments);
			this._set(path, val)
			if(callback)
				callback();
		}
	}
},

mongoose.Document.prototype.didSet = function(path, val){
	if(typeof path == "string" && typeof this["didSet"+path.capitalize()] == "function")
		return this["didSet"+path.capitalize()]._apply(this, {val:val});
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
			callback();
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

var base64File = function(args, callback){
	if(typeof args == "string"){
		args = {
			base64data: args,
			extension: 'png'
		}
	}
	if(!args.base64data){
		return callback(null, {_id:null});
	}
	if(args.base64data.startsWith('data')){
		args.base64data = args.base64data.split(',')[1];
	}
	var me = this;
	var FileModel = model('File');
	FileModel.createFile(args, callback);
};

mongoose.Document.prototype.setBase64File = function(path, val, callback){
	if(!val || typeof val == "string" && val.startsWith('http')){
		this._set(path, val);
		if(callback)
			callback();
	}
	else{
		var me = this;
		base64File(val, function(err, file){
			me._set(path, file._id);
			if(callback)
				callback();
		});
	}
};

mongoose.Document.prototype.setBase64Files = function(path, vals, callback){
	if(vals instanceof Array && !vals.length || vals instanceof Array && typeof vals[0] == "string" && vals[0].startsWith('http')){
		this._set(path, vals);
		if(callback)
			callback();
	}
	else{
		var me = this;
		var files = [];
		async.each(vals.keys(), function(key, callback){
			base64File(vals[key], function(err, file){
				files[key] = file;
				callback(err);
			});
		}, function(err){
			me._set(path, files);
			if(callback)
				callback();
		});
	}
};

mongoose.Document.prototype.willDo = function(action, params, callback){
	if(typeof this["will"+action.capitalize()] == "function"){
		return this["will"+action.capitalize()]._apply(this, params, callback);
	}
	else{
		return callback?callback(null):null;
	}
};

mongoose.Document.prototype.doDo = function(action, params, callback){
	if(typeof this[action] == "function" && this.schema.documentActions[action]){
		this[action]._apply(this, params, callback);
    }
    else{
		callback(new SGError());
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
				return willRes;
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

mongoose.Document.prototype.willUpdate = function(args, callback){
	return callback?callback(null):null;
};

mongoose.Document.prototype.doUpdate = function(args, callback){
	var me = this;
	this.set(args, function(err){
	    if(!err){
	        docToSave = me;
	        if(me.parent)
	        	docToSave = me.parent();
			docToSave.save(function(err){
				callback(err, me);
				me.ensureUpdateConsistency();
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
									// else if(doc.isSemiEmbeddedArray(semiEmbeddedPath)){
									// 	semiEmbeddedDoc = doc.get(semiEmbeddedPath).id(me._id);
									// }
									if(semiEmbeddedDoc){
										var changed = false;
										doc.schema.paths.keys().forEach(function(key){
											var semiEmbeddedKey = key.substring(semiEmbeddedPath.length+1, key.length);
											if(semiEmbeddedKey && !key.endsWith("_id") && key.startsWith(semiEmbeddedPath) && me.get(semiEmbeddedKey) != semiEmbeddedDoc._get(semiEmbeddedKey)){
												doc.set(key, me.get(semiEmbeddedKey));
												//semiEmbeddedDoc[key] = me[key];
												changed = true;
											}
										});
										if(changed){
											doc.save();
										}
									}
								});
							}
						});
					}
				});
			}
		});
	}
};


var generateMeth = function(meth){
	var Meth = meth.capitalize();
	var willMeth = 'will' + Meth;
	var doMeth = 'do' + Meth;
	var didMeth = 'did' + Meth;
	if((meth === 'update') || (meth === 'remove')){
		meth = 'sg' + meth.capitalize();
	}
	var Class = meth=="sgRemove"?mongoose.Model:mongoose.Document;
	Class.prototype[meth] = function (path, args, callback) {
		if(typeof args == "function"){
			callback = args;
			args = {};
		}

		if(!(typeof callback === 'function')) {
			var willRes = this[willMeth](path, args);
			if(willRes instanceof Error || willRes instanceof SGError){
				return willRes;
			}
			var val = this[doMeth](path, args);
			this[didMeth](path, args);
			return val;
		}
		else {
			if(meth == 'sgUpdate') {
				args = null;
			}
			if(meth == 'sgRemove') {
				path = null;
				args = null;
			}
			var me = this;
			var doCallback = function (err, res) {
				if(!err) {
					me[didMeth](path, args);
				}
				callback(err, res);
			};
			var willCallback = function(err) {
				if(!err) {
					me[doMeth](
						(path != null) ? path : doCallback,
						(args !== null) ? args : doCallback,
						doCallback
					);
				}
				else {
					callback(err);
				}
			};
			this[willMeth](
				(path != null) ? path : willCallback,
				(args !== null) ? args : willCallback,
				willCallback
			);
		}
	};
};

['get', 'set', 'do', 'addInArray', 'removeFromArray', 'update', 'remove'].forEach(function(meth){
	generateMeth(meth);
});

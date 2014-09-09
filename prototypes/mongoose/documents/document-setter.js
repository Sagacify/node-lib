var async = require('async');
var utils = require('../utils');

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
	var myargs = arguments
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

var async = require('async');
var utils = require('../utils');

mongoose.Document.prototype.getCreated_at = function() {
	if(this.schema.tree._id.type.name == 'ObjectId' && this._id)
		return new Date(parseInt(this._id.toString().slice(0,8), 16) * 1000);
	else if(this._get('created_at'))
		return this._get('created_at');
	else
		return null;
};

mongoose.Document.prototype.generateSlug = function(baseString, callback){
	if(!baseString){
		this.slug = this._id;
		return callback();
	}

	var modelName = this.getModelName();

	baseString = baseString
		//.replace(/[\s\t]+/g, '_');
		.replace(/[^a-zA-Z0-9]+/g, '_')
		.toLowerCase();

	//var regexSearch = baseString.replace(/\-/, '\\-');
	var regexSearch = new RegExp('^' + baseString + '\-?[0-9]*$');

	var me = this;
	model(modelName).find({
		slug: {
			$regex: regexSearch
		}
	}, {
		slug: 1,
		_id: 0
	}, function (e, docs) {
		if(e){
			me.slug = me._id;
		}
		else{
			if(!docs.length){
				me.slug = baseString;
			}
			else{
				me.slug = baseString + '-' + (docs.length+1);
			}
		}
		callback();
	});
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
	var willGetPath = "willGet"+path.capitalize();
	if(typeof this[willGetPath] == "function"){
		return this[willGetPath]._apply(this, params, callback);
	}
	else{
		return callback?callback(null):null;
	}
};


mongoose.Document.prototype.didGet = function(path, params){
	var didGetPath = "didGet"+path.capitalize();
	if(typeof this[didGetPath] == "function")
		return this[didGetPath]._apply(this, params);
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


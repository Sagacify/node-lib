var async = require('async');

mongoose.Model.populateDevelop = function(callback){
	var context = this.context;
	if(this.length == 0 || !(this[0] instanceof mongoose.Document)){
		callback(null, this);
	}
	else{
		var model = this[0].getModel();
		var fieldsToPopulate = model.populateOptions(context.scope).fields;
		var fieldsToPopulateString = "";
		fieldsToPopulate.forEach(function(fieldToPopulate){
			fieldsToPopulateString += fieldToPopulate + " ";
		});

		var me = this;
		var populateDevelopDocs = function(){
			var indexes = me.keys();
			//indexes.splice(indexes.length-1, 1);
			async.each(indexes, function(index, callback){
				me[index].context = context;
				me[index].populateDevelop(function(err, popDevObj){
					if(!err){
						me[index] = popDevObj;
					}
					callback(err);
				});
			}, function(err){
				callback(err, me);
			});
		};

		if(fieldsToPopulateString){
			model.populate(this, fieldsToPopulateString, function(err, popDocs){
				populateDevelopDocs();
			});
		}
		else{
			populateDevelopDocs();
		}
	}
};


//save, update proto to fire updateCache for this, parents and possibly childs
mongoose.Model.prototype.populateDevelop = function(callback){
	var me = this;
	var model = this.getModel();
	var context = this.context;
	this.populateFromContext(function(err){
		if(!err){
			me.develop(function(err, devObject){
				if(!err){
					me.populateDevelopChildren(devObject, function(err, popDevObject){
						if(!err){
							callback(null, popDevObject);
						}
						else{
							callback(err);
						}
					});
				}
				else{
					callback(err);
				}
			});
		}
		else{
			callback(err);
		}
	});
};

//populate this
mongoose.Model.prototype.populateFromContext = function(callback){
	var me = this;
	var context = this.context;
	var populateOptions = this.getModel().populateOptions(context.scope);
	var fieldsToPopulate = [];

	if(populateOptions.fields){
		fieldsToPopulate = populateOptions.fields.filter(function(fieldToPopulate){
			return !me.populated(fieldToPopulate);
		});
	}

	if(fieldsToPopulate.length == 0){
		callback(null);
	}
	else{
		for(var i = 0; i < fieldsToPopulate.length-1; i++){
			this.populate(fieldsToPopulate[i]);
		}
		this.populate(fieldsToPopulate[i], callback);
	}
};

//create object, remove fields, attach additional fields and do process -> result before cache
mongoose.Model.prototype.develop = function(callback){
	var me = this;
	var context = this.context;
	var developedDoc = this.toObject();

	var model = this.getModel();
	var schema = model.schema;
	var formattedSchema = model.schema.formattedSchema;

	var developOptions = model.developOptions();
	var fields = developOptions.fields;
	var fsKeys = formattedSchema.keys();

	//delete non wanted fields
	var fieldsToDelete = !fields||fields.length==0?[]:developedDoc.keys().diff(fields);
	fieldsToDelete.forEach(function(fieldToDelete){
		delete developedDoc[fieldToDelete];
	});

	//add views
	var fieldsToAdd = fields.diff(fsKeys);
	var cbFields = [];
	var cbFunctions = [];
	fieldsToAdd.forEach(function(fieldToAdd){
		if(me[fieldToAdd] && me[fieldToAdd] in schema.virtuals){
			developedDoc[fieldToAdd] = me[fieldToAdd];
		}
		else if(me[fieldToAdd] && me[fieldToAdd].isFunction()){
			if(me[fieldToAdd].hasCallback()){
				cbFields.push(fieldToAdd);
				cbFunctions.push(me[fieldToAdd]);
			}
			else{
				developedDoc[fieldToAdd] = me[fieldToAdd]();
			}
		}
	});

	async.parallel(cbFunctions, function(err, results){
		if(!err){
			for(var i = 0; i < cbFields.length; i++){
				developedDoc[cbFields[i]] = results[i];
			}
		}
		callback(err, developedDoc);
	});
};

//populateDevelop children
mongoose.Model.prototype.populateDevelopChildren = function(devObject, callback){
	var me = this;
	var context = this.context;
	var options = this.getModel().populateDevelopChildrenOptions(context);
	var docsByPath = {};
	var scan = function(obj, path){
		obj.keys().forEach(function(key){
			var keyPath = path?(path+"."+key):key;
			var val = me._get(keyPath);
			if(val instanceof mongoose.Document || val && val.isArray() && val.length > 0 && val[0] instanceof mongoose.Document){
				docsByPath[keyPath] = val;
			}
			else if(val && val.isObject()){
				scan(val, keyPath);
			}
		});
	};
	scan(devObject);
	async.each(docsByPath.keys(), function(path, callback){
		var childContext = {req:context.req, user:context.user, scope:options.childrenScopes[path]};
		docsByPath[path].context = childContext;
		docsByPath[path].populateDevelop(function(err, popDevChild){
			devObject._set(path, popDevChild);
			callback(err);
		});
	}, function(err){
		callback(err, devObject);
	});
};

//remove unnecessary fields and do additional process after cache
mongoose.Model.overdevelop = function(popDevObject, callback){
	callback(null, popDevObject);
};

mongoose.Model.prototype.getModel = function(){
	return mongoose.models[this.getModelName()];
};

mongoose.Model.prototype.getModelName = function(){
	return mongoose.modelNameFromCollectionName(this.collection.name);
};

mongoose.Model.projectionFields = function(scope){
	return this.developOptions(scope).fields;
};

//require key and ttl: ex. {key:collection:id, ttl:60}
mongoose.Model.cacheOptions = function(context){
	return false;
};

mongoose.Model.populateOptions = function(scope){
	return {fields: []};
};

mongoose.Model.developOptions = function(scope){
	return {fields: []};
};

mongoose.Model.populateDevelopChildrenOptions = function(scope){
	return {childrenScopes: {}};
};

mongoose.Model.overdevelopOptions = function(scope){
	return {fields: []};
};
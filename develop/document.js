var async = require('async');

//save, update proto to fire updateCache for this, parents and possibly childs
mongoose.Document.prototype.populateDevelop = function(callback){
	var me = this;
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
mongoose.Document.prototype.populateFromContext = function(callback){
	var me = this;
	var context = this.context;
	var populateOptions = this.schema.populateOptions(context.scope);
	var fieldsToPopulate = [];

	if(populateOptions.isArray()){
		fieldsToPopulate = populateOptions.filter(function(fieldToPopulate){
			return !me.populated(fieldToPopulate);
		});
	}
	else if(populateOptions.fields){
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
mongoose.Document.prototype.develop = function(callback){
	var me = this;
	var context = this.context;
	var developedDoc = this.toObject();


	var formattedSchema = this.schema.formattedSchema;

	if(!formattedSchema){
		return callback(null, developedDoc);
	}

	var developOptions = this.schema.developOptions(context.scope);
	if(developOptions){
		if(developOptions.isArray()){
			var fields = developOptions;
		}
		else{
			var fields = developOptions.fields;
		}
	}
	else{
		var fields = this.schema.paths.keys().concat(this.schema.documentVirtuals.keys());
	}


	//var fsKeys = formattedSchema.keys();
	var fsKeys = this.schema.paths.keys();
	//delete non wanted fields
	var fieldsToDelete = !fields || (fields.length === 0) ? [] : developedDoc.pathsKeys().diff(fields);
	fieldsToDelete.forEach(function(fieldToDelete){
		delete developedDoc[fieldToDelete];
	});
	//add views
	var fieldsToAdd = fields.diff(fsKeys);
	var cbFields = [];
	var cbFunctions = [];
	fieldsToAdd.forEach(function(fieldToAdd){
		fieldToAddGetter = 'get'+fieldToAdd.capitalize();
		console.log(me)
		if(false && me[fieldToAdd] && me[fieldToAdd] in me.schema.virtuals){
			developedDoc._set(fieldToAdd, me[fieldToAdd]);
		}
		else if(true || me[fieldToAddGetter] && me[fieldToAddGetter].isFunction() && fieldToAdd in me.schema.documentVirtuals){
			if(false && me[fieldToAddGetter].hasCallback()){
				cbFields.push(fieldToAdd);
				cbFunctions.push(me[fieldToAddGetter]);
			}
			else{
				developedDoc._set(fieldToAdd, me.get(fieldToAdd));
				//console.log(developedDoc)
			}
		}
	});

	async.parallel(cbFunctions, function(err, results){
		if(!err){
			for(var i = 0; i < cbFields.length; i++){
				developedDoc._set(cbFields[i], results[i]);
			}
		}
		callback(err, developedDoc);
	});
};

//populateDevelop children
mongoose.Document.prototype.populateDevelopChildren = function(devObject, callback){
	var me = this;
	var context = this.context;
	var options = this.schema.populateDevelopChildrenOptions(context);
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
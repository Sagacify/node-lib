var async = require('async');

//save, update proto to fire updateCache for this, parents and possibly childs
mongoose.Document.prototype.populateDevelop = function(callback){
	var me = this;
	var context = this.context;

	this.populateFromContext(function(err){
		if (err) {
			return callback(err);
		};

		me.develop(function(err, devObject){
			if (err) {
				return callback(err);
			};

			me.populateDevelopChildren(devObject, function(err, popDevObject){
				if (err) {
					return callback(err);
				};

				callback(null, popDevObject);
			});
		});
	});
};

//populate this
mongoose.Document.prototype.populateFromContext = function(callback){
	var me = this;
	var context = this.context||{};
	var populateOptions = typeof this.populateOptions == "function"? this.populateOptions(context.scope) : this.schema.populateOptions(context.scope);
	populateOptions = populateOptions||[];
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
	} else{
			// for(var i = 0; i < fieldsToPopulate.length-1; i++){
			// 	this.populate(fieldsToPopulate[i]);
			// }
			// this.populate(fieldsToPopulate[i], callback);
			this.populate(fieldsToPopulate, callback);
		}
};

mongoose.Types.Embedded.prototype.populate = function(fieldsToPopulate, callback){
	var refs = {};
	var tree = this.schema.tree;

	var me = this;
	async.each(fieldsToPopulate, function(field, callback){
		if (!tree[field]) {
			return callback();
		};
		if (!tree[field].ref) {
			return callback();
		};
		var content = tree[field];
		mongoose.model(content.ref).findById(me[field]).exec(function(err, doc){
			me.set(field, doc);
			
			me[field] = doc;

			callback(err);
		})
	}, callback);
}


//create object, remove fields, attach additional fields and do process -> result before cache
mongoose.Document.prototype.develop = function(callback, customContext){
	var me = this;
	var context = customContext || this.context || {};
	var developedDoc = this.toObject();


	var developOptions = typeof this.developOptions == "function"? this.developOptions(context.scope) : this.schema.developOptions(context.scope);


	if(developOptions){
		if(developOptions.isArray()){
			var fields = developOptions;
		}
		else{
			var fields = developOptions.fields;
		}
	}
	else{
		var fields = this.schema.paths.keys();
		if (this.schema.documentVirtuals) {
			fields = fields.concat(this.schema.documentVirtuals.keys());	
		};
	}
	
	//var fsKeys = formattedSchema.keys();
	var fsKeys = this.schema.paths.keys();
	//delete non wanted fields
	var fieldsToDelete = !fields || (fields.length === 0) ? [] : developedDoc.pathsKeys().diff(fields);
	fieldsToDelete.forEach(function(fieldToDelete){
		delete developedDoc[fieldToDelete];
	});
	//add views
	//var fieldsToAdd = fields.diff(fsKeys);
	var cbFields = [];
	var cbFunctions = [];
	/*fieldsToAdd*/fields.forEach(function(fieldToAdd){

		fieldToAddGetter = 'get'+fieldToAdd.capitalize();

		if(me[fieldToAdd] && me[fieldToAdd] in me.schema.virtuals){
			developedDoc._set(fieldToAdd, me[fieldToAdd]);
		}else if(me[fieldToAddGetter] && me[fieldToAddGetter].isFunction()/* && me.schema.documentVirtuals && fieldToAdd in me.schema.documentVirtuals*/){
			
			if(me[fieldToAddGetter].hasCallback()){
				cbFields.push(fieldToAdd);
				cbFunctions.push(me[fieldToAddGetter].bind(me));
			}
			else{
				developedDoc._set(fieldToAdd, me.get(fieldToAdd));
			}
		} else {
			// console.log('------> Unknow field '+fieldToAdd +" with getter "+fieldToAddGetter);
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
//TODO handle virtuals and actions results
mongoose.Document.prototype.populateDevelopChildren = function(devObject, callback){


	var me = this;
	var context = this.context || {};
	var populateDevelopChildrenOptions = typeof this.populateDevelopChildrenOptions == "function"? this.populateDevelopChildrenOptions(context.scope) : this.schema.populateDevelopChildrenOptions(context.scope);
	//populateDevelopChildrenOptions = populateDevelopChildrenOptions||[];
	populateDevelopChildrenOptions = populateDevelopChildrenOptions.childrenScopes||populateDevelopChildrenOptions;

	var docsByPath = {};
	var scan = function(obj, path){
		obj.keys().forEach(function(key){
			var keyPath = path?(path+"."+key):key;

			var keyPathGetter = 'get'+keyPath.capitalize();
			var val;
			if(keyPath in me.schema.paths && typeof me[keyPathGetter] != "function"){
				val = me._get(keyPath);
			}
			else{
				val = obj._get(keyPath);
			}
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
		var childContext = {req:context.req, user:context.user, scope:populateDevelopChildrenOptions[path], parentDoc:me};
		docsByPath[path].setHidden('context', childContext);
		docsByPath[path].populateDevelop(function(err, popDevChild){
			devObject._set(path, popDevChild);
			callback(err);
		});
	}, function(err){		
		callback(err, devObject);
	});
};
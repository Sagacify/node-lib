var async = require('async');
var HalloweenSkelleton = require('../../dataskelleton/HalloweenSkelleton');
require('../../validation/SGSchemaValidation');

mongoose.Schema.prototype.getFormattedSchema = function (options, callback) {
	//this.paths[key].validators[0][0]
	if(arguments.length == 1 && typeof options == "function")
		callback = options;

	var me = this;
	var getFormattedSchemaElement = function (schemaElement, callback) {
		if(schemaElement.tree) {
			var formattedSchema = {};
			async.forEach(schemaElement.tree.keys(), function (key, callback) {
				getFormattedSchemaElement(schemaElement.tree[key], function (err, formattedSchemaElement) {
					if(!err) {
						if(formattedSchemaElement)
							formattedSchema[key] = formattedSchemaElement;
					}
					callback(err);
				});
			}, function (err) {
				if(!err) {
					schemaElement.formattedSchema = formattedSchema;
				}
				callback(err, formattedSchema);
			});
		}
		//array
		else if(schemaElement instanceof Array) {
			var formattedArray = [];
			formattedArray.public = schemaElement.public;
			async.forEach(schemaElement, function (arrayItem, callback) {
				getFormattedSchemaElement(arrayItem, function (err, formattedArrayItem) {
					if(!err) {
						formattedArray.push(formattedArrayItem);
					}
					callback(err);
				});
			}, function (err) {
				callback(err, formattedArray);
			});
		}
		else if(schemaElement.ref) {
			callback(null, {type:schemaElement.type, ref:schemaElement.ref, public:schemaElement.public});
		}
		else if(schemaElement.name) {
			callback(null, {type:schemaElement.name, public:schemaElement.public});
		}
		else if(schemaElement.type && schemaElement.type.name) {
			callback(null, {type:schemaElement.type.name, public:schemaElement.public});
		}
		else if(schemaElement.path) {
			callback(null, null);
		}
		else if(schemaElement == "string") {
			callback(null, {type:"String"});
		}
		//simple dictionary
		else{
			var formattedDic = {};
			async.forEach(schemaElement.keys(), function (key, callback) {
				getFormattedSchemaElement(schemaElement[key], function (err, formattedSchemaElement) {
					if(!err) {
						if(formattedSchemaElement)
							formattedDic[key] = formattedSchemaElement;
					}
					callback(err);
				});
			}, function (err) {
				callback(err, formattedDic);
			});
		}
	}

	if(this.formattedSchema)
		callback(null, this.formattedSchema);
	else
		getFormattedSchemaElement(this, callback);
};

// mongoose.Schema.prototype.formattedSchemaElement = function (path) {
// 	var itemSchema = this.tree._get(path);
// 	if(!itemSchema) {
// 		return null;
// 	}
// 	else if(itemSchema instanceof mongoose.Types.DocumentArray) {

// 	}
// 	else if(itemSchema.isArray()) {
// 		return [this.pathType(path+".0")];
// 	}
// 	else if(itemSchema.isObject()) {

// 	}
// 	else {
// 		return {type:itemSchema};
// 	}
// };

mongoose.Schema.prepareSchemas = function () {
	var Skelleton = HalloweenSkelleton.getSkelleton();

	mongoose.models.keys().forEach(function (model) {
		mongoose.models[model].schema.skelleton = Skelleton[model];
		mongoose.models[model].schema.getFormattedSchema(function (err, fs) {});
		mongoose.models[model].schema.setDefaultVirtualsActions();
		mongoose.models[model].schema.prepareSchemaValidation(model);
	});
};

mongoose.Schema.prototype.hasVirtual = function (name) {
	return this.documentVirtuals[name]||this.collectionVirtuals[name];
};

mongoose.Schema.prototype.hasAction = function (name) {
	return this.documentActions[name]||this.collectionActions[name];
};

mongoose.Schema.prototype.setDefaultVirtualsActions = function () {
	if(!this.documentVirtuals)
		this.documentVirtuals = {};
	if(!this.documentActions)
		this.documentActions = {};
	if(!this.collectionVirtuals)
		this.collectionVirtuals = {};
	if(!this.collectionActions)
		this.collectionActions = {};
};

mongoose.Schema.prototype.setVirtuals = function (sgVirtuals) {
	this.sgVirtuals = sgVirtuals;
};

mongoose.Schema.prototype.setActions = function (sgActions) {
	this.sgActions = sgActions;
};

mongoose.Schema.prototype._get = mongoose.Schema.prototype.get;

mongoose.Schema.prototype.get = function (path, callback) {
	if(!callback) {
		return this._get(path);
	}
	var schema = this.schema?this.schema:this;
	if(typeof schema.statics[path] == "function") {
		if(schema.statics[path].getParamNames()[0] === "callback") {
			schema.statics[path].apply(this, [callback]);
		}
		else{
			callback(null, schema.statics[path].apply(this));
		}
	}
	else{
		callback(null, schema.statics[path]);
	}
};

mongoose.Schema.prototype.willDo = function(action, params, callback){
	if(typeof this.statics["will"+action.capitalize()] == "function"){
		return this.statics["will"+action.capitalize()]._apply(this, params, callback);
	}
	else{
		return callback?callback(null):null;
	}
};

mongoose.Schema.prototype.doDo = function (action, params, callback) {
	if(this instanceof mongoose.Schema) {
		this.statics[action]._apply(this, params, callback);
	}
	else if(this instanceof Array && this.schema.collectionActions[action]) {
		this.schema.statics[action]._apply(this, params, callback);
	}
	else if(this instanceof Array && this.length > 0 && typeof this[0][action] == "function") {
		var me = this;
		var responses = [];
		async.each(this.keys(), function (docIndex, callback) {
			this[docIndex].do(action, params, function (err, response) {
				responses[docIndex] = response;
				callback(err);
			});
		}, function (err) {
			callback(err, responses);
		});
	}
	else{
		callback(new SGError());
	}
};

mongoose.Schema.prototype.didDo = function(action, params){
	if(typeof this.statics["did"+action.capitalize()] == "function")
		return this.statics["did"+action.capitalize()]._apply(this, params);
};

mongoose.Schema.prototype.sgUpdate = function (args, callback) {
	var me = this;
	async.each(this, function (doc, callback) {
		doc.sgUpdate(args, callback);
	}, function (err) {
		callback(err, me);
	});
};

mongoose.Schema.prototype.sgRemove = function (item) {
	if(typeof item == "function") {
		var callback = item;
		async.each(this, function (doc, callback) {
			doc.remove(callback);
		}, function (err) {
			callback(err);
		});
	}
	else{
		this.sgRemove(item);
	}
};

mongoose.Schema.prototype.getValidationRules = function (field_path) {
	return this.path(field_path).options.validation || [];
};

var async = require('async');

mongoose.Model.prototype.created_at = function() {
	if(this.schema.tree._id.type.name == 'ObjectId')
 		return new Date(parseInt(this._id.toString().slice(0,8), 16) * 1000);
 	else if(this.created_at)
 		return created_at;
 	else
 		return null;
};

mongoose.Model.prototype.saveCache = function(options, callback){
	if(typeof options == "function")
		callback = options;
	redisClient.set(this.collection.name, this.id, JSON.stringify(this));
	this.save(callback);
};

mongoose.Model.prototype.removeCache = function(conditions, callback){
	redisClient.del(this.collection.name, this.id, JSON.stringify(this));
	this.remove(conditions, callback);
};

mongoose.Model.prototype.updateCache = function(modifiedPaths){

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

	var fieldsToDelete = !fields||fields.length==0?[]:developedDoc.keys().diff(fields);
	fieldsToDelete.forEach(function(fieldToDelete){
		delete developedDoc[fieldToDelete];
	});


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

mongoose.Model.developScope = function(finalScope){
	return finalScope;
};

mongoose.Model.getContext = function(query, scope){

	return {req:req, user:req.user, developScope:scope, overscope:scope}
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

mongoose.Model.prototype.set = function set(path, val, type, options){
	if(path && path.isObject()){
		var me = this;
		path.keys().forEach(function(key){
			me.set(key, path[key]);
		});
	}
	else{
		var setterName = "set"+path.capitalize();
		if(typeof this[setterName] == "function" && set.caller != this[setterName]){
			this[setterName](val);
		}
		else{
			this._set.apply(this, arguments);
		}
	}
},

mongoose.Model.handle = function(options){
	options = options||{};
	var me = this;
	return function(req, res){
		var filter = {};
		req.query.keys().forEach(function(queryKey){
			if(req.query[queryKey] != "offset" && req.query[queryKey] != "limit" && req.query[queryKey] != "sort")
				filter[queryKey] = req.query[queryKey];
		});
		req.mixin = req.params.clone().merge(req.body).merge({paginate:{offset:req.query.offset, limit:req.query.limit}, sort:req.query.sort, filter:filter});
		var context = {req:req, user:req.user, scope:options.scope};

		var splitPath = req.route.path.split('/');
		splitPath.popFirst();
		splitPath.popFirst();
		if(!splitPath.last())
			splitPath.pop();

		var splitUrl = req.url.split('/');
		splitUrl.popFirst();
		splitUrl.popFirst();
		if(!splitUrl.last())
			splitUrl.pop();

		var collectionName = splitPath.popFirst();
		splitUrl.popFirst();
		var model = mongoose.model(mongoose.modelNameFromCollectionName(collectionName));
		model.context = context;
		var callback = function(err, collDoc){
			if(!err){
				if(collDoc && typeof collDoc.populateDevelop == "function"){
					if(!collDoc.context)
						collDoc.context = context;
					collDoc.populateDevelop(function(err, devCollDoc){
						res.SGsend(err||devCollDoc);
					});
				}
				else{
					res.SGsend(collDoc);
				}
			}
			else{
				res.SGsend(err);
			}
		}

		if(splitPath.length == 0){
			if(req.method == "GET"){
				model.process._apply(me, req.mixin, callback);
			}
			else if(req.method == "POST"){
				model.create(req.body.doc, callback);
			}
		}
		else{
			var collDoc = model;
			var popCollDoc = function(){
				if(collDoc){
					collDoc.context = context;
				}
				//stop routing
				if(splitPath.length == 0 || !collDoc || (collDoc instanceof Array && collDoc.length == 0)){
					if(req.method == "GET"){
						callback(null, collDoc);
					}
					else if(req.method == "PUT"){
						collDoc.set(req.body);
						collDoc.save(function(err){
							callback(err, collDoc);
						});
					}
					else if(req.method == "DELETE"){
						collDoc.delete(function(err){
							callback(err);
						});
					}
					else{
						callback(new SGError());
					}
					return;
				}
				if(collDoc instanceof Array && collDoc[0]){
					collDoc.modelName = collDoc[0].getModelName();
					collDoc.model = collDoc[0].getModel();
				}

				var pathPart = splitPath.popFirst();
				var urlPart = splitUrl.popFirst();

				if(pathPart == urlPart){
					var caller = (collDoc instanceof Array)?collDoc.model:collDoc;
					var call = function(){
						//action on doc or coll
						if(req.method == "POST" && splitUrl.length == 0 && typeof caller[urlPart] == "function"){
							caller.do.apply(collDoc, [urlPart, req.mixin, callback]);
						}
						//create doc in array 
						if(req.method == "POST" && splitUrl.length == 0 && collDoc instanceof mongoose.Document && collDoc[urlPart] instanceof Array){
							if(collDoc[urlPart] instanceof mongoose.Types.DocumentArray){
								collDoc[urlPart].push(req.body.doc);
								collDoc.save(callback);
							}
							else if(collDoc.getModel().schema.tree[urlPart][0].ref){
								var model = mongoose.model(collDoc.getModel().schema.tree[urlPart][0].ref);
								var doc = new model(req.body.doc);
								doc.save(function(err){
									if(!err){
										collDoc[urlPart].push(doc);
										collDoc.save(callback);
									}
								});
							}
							else{
								collDoc[urlPart].push(req.body.item);
								collDoc.save(callback);
							}
						}
						//delete simple type or reference from array
						// !caller[urlPart]
						if(req.method == "DELETE" && splitUrl.length == 1 && collDoc instanceof mongoose.Document && collDoc[urlPart] instanceof Array && !(collDoc[urlPart] instanceof mongoose.Types.DocumentArray) && splitUrl[0] != splitPath[0]){
							collDoc[urlPart].delete(splitUrl[0]);
							collDoc.save(function(err){
								callback(err, collDoc);
							});
						}
						//follow route by getting next doc or coll
						else{
							caller.get.apply(collDoc, [urlPart, function(err, cd){
								if(!err){
									collDoc = cd;
									popCollDoc();
								}
								else{
									callback(err);
								}
							}]);
						}
					}

					var schemaTree = caller.getModel().schema.tree;
					if(caller instanceof mongoose.Document && caller && schemaTree[urlPart] && schemaTree[urlPart].ref && !caller.populated(urlPart)){
						caller.populate(urlPart, function(err){
							call();
						});
					}
					else{
						call();
					}
				}
				else if(pathPart.toLowerCase().endsWith('id')){
					if(collDoc instanceof mongoose.Types.DocumentArray){
						collDoc = collDoc.id(urlPart);
						popCollDoc();
					}
					else if(collDoc.name == "model"){
						collDoc.findById(urlPart, function(err, doc){
							if(!err){
								collDoc = doc;
								popCollDoc();
							}
							else{
								callback(err);
							}
						});
					}
					else{
						callback(new SGError());
					}
				}
				else{
					var filter = {};
					var key = pathPart.substring(1, urlPart.length);
					filter[key] = urlPart;
					this.process.apply(collDoc, [filter, null, null, function(err, coll){
						if(!err){
							collDoc = coll;
							popCollDoc(callback);
						}
						else{
							callback(err);
						}
					}]);
				}
			}
			popCollDoc();
		}
	};
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
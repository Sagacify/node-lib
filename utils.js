var async = require('async');

var utilsPaths = ["./slug"];
utilsPaths.forEach(function(path){
	var elem = require(path);
	for(var meth in elem){
		exports[meth] = elem[meth];
	}
});

exports.cloneObject = function cloneObject(obj) {
  var clone = {};
  for(var i in obj) {
    if(typeof(obj[i])=="object")
      clone[i] = this.cloneObject(obj[i]);
    else
      clone[i] = obj[i];
  }
  return clone;
}

exports.mergeRecursive = function (obj1, obj2) {
  for (var p in obj2)
    try {
      // Property in destination object set; update its value.
      if ( obj2[p].constructor==Object )
        obj1[p] = MergeRecursive(obj1[p], obj2[p]);
      else
        obj1[p] = obj2[p];
    } catch(e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];
    }
  return obj1;
}


exports.capitalize = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.mongooseErrorHandler = function (err, req) {
  var errors = err.errors;
  for (var error in errors) {
    req.flash('error', errors[error].type);
  }
}

exports.sizeOfObject = function(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};


exports.addJSONMetaData = function(json, limit, offset){
	
	if (json instanceof Array){
		return {
			meta : {
				code : 200,
				limit : (limit) ? limit : global.defaultLimit,
				offset : (offset) ? offset : 0,
				total_count : json.length,
				},
			object : json
			};
	}
	else
		return {
			meta : {
				code : 200,
				total_count: json?1:0
			},
			object : json
		};
};



exports.getStringForLanguage = function(multiLingualField, userLang, defaultLang){
	
	/* If no multiLinguality */
	if(!multiLingualField || typeof multiLingualField === "string"){
		return multiLingualField;
	}
	
	/* Return the best language according to the users language settings*/
	if(userLang){
		for (var i in userLang){
			if (userLang[i] in multiLingualField){
				return multiLingualField[userLang[i]];
			}
		}
	}
	
	/*Return the default language */
	if (defaultLang in multiLingualField){
		return multiLingualField[defaultLang];
	}
	
	/* Return the first language available*/
	for (var lang in multiLingualField){
		return multiLingualField[lang];
	}
}

exports.i18n = function(doc, multiLingualFieldKeys, user, defaultLang){
	for(var i in multiLingualFieldKeys){
		var multiLingualFieldKey = multiLingualFieldKeys[i];
		doc[multiLingualFieldKey] = exports.getStringForLanguage(doc[multiLingualFieldKey], user?user.userLang:null, defaultLang);
	}
}

// Differentiate limit & offset parameters from the query parameters
exports.getQueryParams = function(req, res, next){
	if ('lang' in req.query){
		req.multiLingual = req.query.lang;
		delete req.query.lang;
	}
	else {
		req.multiLingual = false;
	}
	
	if ('limit' in req.query){
		req.limit = req.query.limit;
		delete req.query.limit;
	}
	if ('offset' in req.query){
		req.offset = req.query.offset;
		delete req.query.offset;
	}
	delete req.query['token'];
	
	req.filters = req.query;
	next();
}

exports.findObjectsWithParam = function(myObject, paramString){
	return function(req, res, next){
		//console.log(req.limit);
		//console.log(req.offset);
		
		/*Merge attribute from initQuery*/
		if (paramString){
			if(paramString instanceof Array)
				for(var i in paramString)
					req.query[paramString[i]] = req.params[paramString[i]];
			else
				req.query[paramString] = req.params[paramString];
		}
		
		//for (var attrname in initQuery) {req.query[attrname] = initQuery[attrname];}
		if (req.limit == 0 && ! req.offset){
			req.q = myObject.find(req.query);
		}
		else if (req.limit && req.offset){
			req.q = myObject.find(req.query).skip(req.offset).limit(req.limit);
		}
		else if (req.limit && !req.offset){
			req.q = myObject.find(req.query).limit(req.limit);
		}
		else {
			req.q = myObject.find(req.query).limit(global.defaultLimit);
		}

		next();
	}
}

	//Check is the required parameters are present
exports.checkParams = function(arr){
	return function(req, res, next) {
		// Make sure each param listed in arr is present in req.query
		var missing_params = [];
		for(var i=0;i<arr.length;i++){
			// console.log(arr[i]);
			// console.log(req.query);
			// console.log(arr[i] in req.query);
			if ((arr[i] in req.query)){
				// console.log(arr[i]);
				continue;
			}
			else {
				next(new Error({ "error" : "query error", "message" : "Parameter(s) missing: " + missing_params.join(",") }));
			}
		}
		next();
	}
}



exports.addDefaultLanguage = function(me, modelMongo, callback){
	me.model(modelMongo).findById(me.place).exec(function(err, place){
		if(!err && place){
			me.defaultLanguage = place.defaultLanguage;
			callback(null);
		}
		else {
			callback(err);
		}
	});
}

exports.generateKeywords = function(phrase){

	keywords = [];
	if (phrase) {
		phrase.split(" ").forEach(function(word){
			if (word){
				keywords.push(word.toLowerCase());
			}
		});
	}

	return keywords;
}



exports.processedDoc = function(doc, virtualFields, deletedFields){
	var processedDoc = doc.toObject();
	
	delete processedDoc.__v;
	
	for(var i = 0; i < virtualFields.length; i++) {
		var virtualValue = doc[virtualFields[i]];
		if(virtualValue != null && virtualValue != undefined) {
			processedDoc[virtualFields[i]] = virtualValue;
		}
	}
	
	for(var j = 0; j < deletedFields.length; j++) {
		var splittedDeleteFields = deletedFields[j].split(".");
		if(splittedDeleteFields.length == 1)
			delete processedDoc[splittedDeleteFields[0]];
		if(splittedDeleteFields.length == 2)
			delete processedDoc[splittedDeleteFields[0]][splittedDeleteFields[1]];
		if(splittedDeleteFields.length == 3)
			delete processedDoc[splittedDeleteFields[0]][splittedDeleteFields[1]][splittedDeleteFields[2]];
	}
	
	return processedDoc;
}

//develop doc or array of docs
exports.developArrDoc = function(arrDoc, user, options, callback){
	if(arrDoc instanceof Array){
		var developedObjs = [];
		async.forEachSeries(arrDoc, function(doc, callback){
			exports.developArrDoc(doc, user, options, function(err, developedObj){
				developedObjs.push(developedObj);
				callback(err);
			});
		}, function(err){
			callback(err, developedObjs);
		});
	}
	else{
		if(!arrDoc || !arrDoc.develop){
			return callback(null, arrDoc);
		}
		arrDoc.develop(user, options, callback);
	}
}

exports.populateDevelopSubObjs = function(arrObj, arrDoc, fieldsToPopulate, user, options, callback){
	if(arrObj instanceof Array){
		var tmp = 0;
		async.forEach(arrDoc, function(doc, callback){
			var index = tmp;
			tmp++;
			exports.populateDevelopSubObjs(arrObj[index], doc, fieldsToPopulate, user, options, callback);
		}, function(err){
			callback(err);
		});
	}
	else{
		var obj = arrObj;
		var doc = arrDoc;

		var childFields = fieldsToPopulate.filter(function(item){
			for(var i = 0; i < fieldsToPopulate.length; i++){
				if(item.startsWith(fieldsToPopulate[i]) && item != fieldsToPopulate[i])
					return false;
			}
			//if(obj[item] == undefined)
			if(exports.getRecursiveField(doc, item) == undefined)
				return false;
			if(exports.getRecursiveField(obj, item) == undefined)
				return false;
			return true;
		});
		async.forEach(childFields, function(childField, callback){
			var subOptions = options?options[childField]:null;
			
			var grandChildFields = fieldsToPopulate.filter(function(item){
				return item.startsWith(childField) && item != childField;
			});
			
			for(var i = 0; i < grandChildFields.length; i++){
				grandChildFields[i] = grandChildFields[i].substring(childField.length+1, grandChildFields[i].length);
			}
				
			var developPopulatedField = function(arrDoc, fieldsToPopulate, user, options, callback){
				exports.developArrDoc(arrDoc, user, options, function(err, arrObj){
					if(!err){
						exports.populateDevelopSubObjs(arrObj, arrDoc, fieldsToPopulate, user, options, function(err){
							callback(err, arrObj);
						});	
					}
					else
						callback(err);
				});
			}
			if(exports.getRecursiveField(doc, childField) instanceof Array){
				if(exports.getRecursiveField(doc, childField).length > 0 && typeof exports.getRecursiveField(doc, childField)[0].develop == "function"){
					developPopulatedField(exports.getRecursiveField(doc, childField), grandChildFields, user, subOptions, function(err, subArrObj){
						if(!err)
							exports.setRecursiveField(obj, childField, subArrObj);
						callback(err);
					});
				}
				else if(exports.getRecursiveField(doc.schema.tree, childField) && exports.getRecursiveField(doc.schema.tree, childField)[0].ref) {
					mongoose.model(exports.getRecursiveField(doc.schema.tree, childField)[0].ref).find({_id:{$in:exports.getRecursiveField(doc, childField)}}, exports.populateDevelop(grandChildFields, user, subOptions, function(err, subArrObj){
						if(!err)
							exports.setRecursiveField(obj, childField, subArrObj);
						callback(err);
					}));	
				}
				else{
					callback(null);
				}
			}
			else{
				var recursiveObjValue = exports.getRecursiveField(doc, childField);
				var recursiveSchemaValue = exports.getRecursiveField(doc.schema.tree, childField); 
				if(recursiveObjValue && typeof recursiveObjValue.develop == "function"){
					developPopulatedField(recursiveObjValue, grandChildFields, user, subOptions, function(err, subArrObj){
						if(!err)
							exports.setRecursiveField(obj, childField, subArrObj);
						callback(err);
					});
				}
				else if(recursiveSchemaValue && recursiveSchemaValue.ref){
					var start = new Date().getTime();
					mongoose.model(recursiveSchemaValue.ref).findById(recursiveObjValue, exports.populateDevelop(grandChildFields, user, subOptions, function(err, subObj){
						if(!err)
							exports.setRecursiveField(obj, childField, subObj);
						callback(err);
					}, start));
				}
				else if(recursiveObjValue && recursiveObjValue.ref && recursiveObjValue.type){
					var start = new Date().getTime();
					mongoose.model(recursiveObjValue.ref).findById(recursiveObjValue.type, exports.populateDevelop(grandChildFields, user, subOptions, function(err, subObj){
						if(!err)
							exports.setRecursiveField(obj, childField, subObj);
						callback(err);
					}, start));
				}
				else{
					callback(null);
				}
			}
		}, function(err){
			callback(err);
		});
	}
};

/*
exports.populateDevelopSubObjs_old = function(arrObj, arrDoc, fieldsToPopulate, user, options, callback){
	if(arrObj instanceof Array){
		var tmp = 0;
		async.forEach(arrDoc, function(doc, callback){
			var index = tmp;
			tmp++;
			exports.populateDevelopSubObjs(arrObj[index], doc, fieldsToPopulate, user, options, callback);
		}, function(err){
			callback(err);
		});
	}
	else{
		var obj = arrObj;
		var doc = arrDoc;
		var childFields = fieldsToPopulate.filter(function(item){
			return item.split(".").length == 1;
		});
		async.forEach(childFields, function(childField, callback){
			var subOptions = options?options[childField]:null;
			
			var grandChildFields = fieldsToPopulate.filter(function(item){
				var splitItem = item.split(".");
				return splitItem.length > 1 && splitItem[0]==childField;
			});
			
			for(var i = 0; i < grandChildFields.length; i++){
				grandChildFields[i] = grandChildFields[i].substring(grandChildFields[i].indexOf(".")+1, grandChildFields[i].length);
			}
				
			var developPopulatedField = function(arrDoc, fieldsToPopulate, user, options, callback){
				exports.developArrDoc(arrDoc, user, options, function(err, arrObj){
					if(!err){
						exports.populateDevelopSubObjs(arrObj, arrDoc, fieldsToPopulate, user, options, function(err){
							callback(err, arrObj);
						});	
					}
					else
						callback(err);
				});
			}
			
			if(doc[childField] instanceof Array){
				if(doc[childField].length > 0 && typeof doc[childField][0].develop == "function"){
					developPopulatedField(doc[childField], grandChildFields, user, subOptions, function(err, subArrObj){
						if(!err)
							obj[childField] = subArrObj;
						callback(err);
					});
				}
				else if(doc.schema.tree[childField][0].ref) {
					mongoose.model(doc.schema.tree[childField][0].ref).find({_id:{$in:obj[childField]}}, exports.populateDevelop(grandChildFields, user, subOptions, function(err, subArrObj){
						if(!err)
							obj[childField] = subArrObj;
						callback(err);
					}));	
				}
				else{
					callback(null);
				}
			}
			else{
				if(doc[childField] && typeof doc[childField].develop == "function"){
					developPopulatedField(doc[childField], grandChildFields, user, subOptions, function(err, subArrObj){
						if(!err)
							obj[childField] = subArrObj;
						callback(err);
					});
				}
				else if(doc.schema.tree[childField].ref){
					mongoose.model(doc.schema.tree[childField].ref).findById(obj[childField], exports.populateDevelop(grandChildFields, user, subOptions, function(err, subObj){
						if(!err)
							obj[childField] = subObj;
						callback(err);
					}));
				}
				else if(obj[childField].ref && obj[childField].type){
					mongoose.model(obj[childField].ref).findById(obj[childField].type, exports.populateDevelop(grandChildFields, user, subOptions, function(err, subObj){
						if(!err)
							obj[childField] = subObj;
						callback(err);
					}));
				}
				else{
					callback(null);
				}
			}
		}, function(err){
			callback(err);
		});
	}
};*/

exports.populateDevelopArrDoc = function(arrDoc, fieldsToPopulate, user, options, callback){
	if(arrDoc instanceof Array){
		for(var i = 0; i < arrDoc.length; i++){
			for(var key in arrDoc[i].schema.tree){
				if(arrDoc[i][key] instanceof Array && arrDoc[i][key].length > 0 && typeof arrDoc[i][key][0].develop == "function" && fieldsToPopulate.indexOf(key) == -1)
					fieldsToPopulate.push(key);	
				if(arrDoc[i][key] && typeof arrDoc[i][key].develop == "function" && fieldsToPopulate.indexOf(key) == -1)
					fieldsToPopulate.push(key);	
				}
		}
	}
	else if(arrDoc){
		for(var key in arrDoc.schema.tree){
			if(arrDoc[key] instanceof Array && arrDoc[key].length > 0 && typeof arrDoc[key][0].develop == "function" && fieldsToPopulate.indexOf(key) == -1)
				fieldsToPopulate.push(key);	
			if(arrDoc[key] && arrDoc[key]._id && typeof arrDoc[key].develop == "function" && fieldsToPopulate.indexOf(key) == -1)
				fieldsToPopulate.push(key);
		}
	}
	exports.developArrDoc(arrDoc, user, options, function(err, arrObj){
		if(!err){
			exports.populateDevelopSubObjs(arrObj, arrDoc, fieldsToPopulate, user, options, function(err){
				callback(err, arrObj);
			});	
		}
		else
			callback(err);
	});
};

exports.populateDevelop = function(fieldsToPopulate, user, options, callback){
	return function(err, arrDoc){
		if(err) return callback(err);
		if(!arrDoc) return callback(null, null);
		exports.populateDevelopArrDoc(arrDoc, fieldsToPopulate, user, options, callback);
	}
}

exports.develop = function(user, options, callback){
	return exports.populateDevelop([], user, options, callback);
}

exports.update = function(doc, params, callback){
	if(!doc){
		callback({success: false});
		return;
	}
	/*var ImageModel = mongoose.model("Image");
	var images = {};
	var keys = [];
	for(var key in params)
		if(doc[key] != params[key])
			keys.push(key);
	async.forEach(keys, function(key, callback){
		if(doc.schema.tree[key] instanceof Array){
			if(doc.schema.tree[key][0].ref == "Image"){
				var newImages = params[key].filter(function(item){
					return doc[key].indexOf(item)==-1;
				});
				var imagesToDelete = doc[key].filter(function(item){
					return params[key].indexOf(item)==-1;
				});
				async.parallel([function(callback){
					async.forEach(newImages, function(newImage, callback){ImageModel.preAttachProcess(params[key], callback);});
				}, function(callback){
					async.forEach(imagesToDelete, function(imageToDelete, callback){ImageModel.delete(imageToDelete, callback);});
				}], function(err, results){
					if(!err)
						doc[key] = params[key];
					callback(err);
				})
			}
			else{
				doc[key] = params[key];
				callback(null);
			}
		}
		else{
			//if(doc.schema.tree[key] && doc.schema.tree[key].name == "Date")
			if(doc.schema.tree[key] && doc.schema.tree[key].ref == "Image"){
				if(doc[key]!=params[key]||doc[key]._id!=params[key]){
					ImageModel.preAttachProcess(params[key], function(err){
						if(!err)
							doc[key] = params[key];
						callback(err);
					});
				}
				else{
					callback(null);
				}
			}
			else{
				doc[key] = params[key];
				callback(null);
			}
		}
	}, function(err){
		if(!err)
			doc.save(callback);
		else
			callback(err);
	});*/
	var keys = [];
	for(var key in params)
		if(doc[key] != params[key])
			keys.push(key);
	async.forEach(keys, function(key, callback){
		if(typeof doc.updateValue == "function"){
			doc.updateValue(key, params[key], callback);
		}
		else{
			doc.set(key, params[key]);
			callback(null);
		}
		if(key == "tags"){
			params[key].forEach(function(tag){
				mongoose.model('Tag').getCreateTag(tag);
			});
		}
	}, function(err){
		if(!err)
			doc.save(callback);
		else
			callback(err);
	});
};

exports.updateDevelop = function(doc, params, fieldsToPopulate, user, options, callback){
	exports.update(doc, params, function(err){
		if(!err){
			var query = mongoose.model(exports.modelNameFromCollectionName(doc.collection.name)).findById(doc._id);
			exports.attachQueryParams(query, null, fieldsToPopulate);
			query.exec(exports.populateDevelop(fieldsToPopulate, user, options, callback));
		}
		else
			callback(err);
	});
};

exports.generateFromURI = function(fieldsToPopulate, developOptions, logActivity, callback){
	return function(req, res) {
		exports.handleResultFromURI(req, res, fieldsToPopulate, developOptions, logActivity, callback);
	}
};

exports.handleResultFromURI = function(req, res, fieldsToPopulate, developOptions, logActivity, callback){
	var handleDelete = function(err){
		if(!err){
			res.send({success: true});
		}
		else{
			res.send({success: false, msg:"Delete error."});
		}
	}
	var splitRoute = req.route.path.split("/");
	var splitUrl = req.url.split("?")[0].split("/");
	var modelString = exports.modelNameFromCollectionName(splitRoute[2]);
	var model = mongoose.model(modelString);
	var objectFieldsToPopulate = [];
	fieldsToPopulate.forEach(function(fieldToPopulate){
		var splitField = fieldToPopulate.split(".");
		if(splitField[0] == "object")
			objectFieldsToPopulate.push(splitField[1]);
	});
	switch(req.method){
		case "GET":
		if(splitRoute.length<5){
			if(splitRoute.length==3)
				var query = exports.getQueryFromRequest(model, req, fieldsToPopulate);
			if(splitRoute.length==4)
				var query = model.findById(splitUrl[3]);
			//exports.attachQueryParams(query, req, fieldsToPopulate);
			query.exec(exports.populateDevelop(fieldsToPopulate, req.user, developOptions, exports.handleResult(res)));
		}
		if(splitRoute.length == 5){
			var query = model.findById(splitUrl[3]);
			if(model.schema.tree[splitUrl[4]] instanceof Array && model.schema.tree[splitUrl[4]][0].ref || model.schema.tree[splitUrl[4]].ref)
				query.populate(splitUrl[4]);
			query.exec(function(err, doc){
				if(!err){
					exports.developArrDoc(doc[splitUrl[4]], req.user, developOptions, function(err, arrObj){
						if(!err){
							exports.populateDevelopSubObjs(arrObj, doc[splitUrl[4]], fieldsToPopulate, req.user, developOptions, function(err){
								res.send(exports.objectToSend(err, arrObj));
							});	
						}
						else
							res.send({success:false});
						if(callback)
							callback(req.user, doc);
					});
				}
				else{
					res.send({success:false});
				}
			});
		}
		break;
		case "PUT":
		if(splitRoute.length==4){
			model.findById(splitUrl[3], function(err, doc){
				if(!err){
					if(logActivity){
						for(var key in req.body){
							if(!(req.body[key] instanceof Object) && doc[key] != req.body[key])
								mongoose.model('Activity').logUpdate({type:splitUrl[3], ref:modelString, fieldsToPopulate:objectFieldsToPopulate}, req.user, {key:key, oldValue:doc[key], newValue:req.body[key]});
						}
					}
					exports.updateDevelop(doc, req.body, fieldsToPopulate, req.user, developOptions, exports.handleResult(res));
					if(callback)
						callback(req.user, doc);
				}
				else{
					res.send({success: false});		
				}
			});
		}
		break;
		case "POST":
		if(splitRoute.length==3){
			var doc = new model({});
			exports.updateDevelop(doc, req.body, fieldsToPopulate, req.user, developOptions, exports.handleResult(res));
			if(logActivity){
				mongoose.model('Activity').logCreate({type:doc._id, ref:modelString, fieldsToPopulate:objectFieldsToPopulate}, req.user);
			}
			if(callback)
				callback(req.user, doc);
		}
		if(splitRoute.length==5){
			model.findById(splitUrl[3], function(err, doc){
				if(!err){
					if(splitRoute[4] == "like"){
						if(doc.likes.indexOf(req.user._id) == -1)
							doc.likes.push(req.user._id);
						exports.updateDevelop(doc, {}, fieldsToPopulate, req.user, developOptions, exports.handleResult(res));
						if(callback)
							callback(req.user, doc);
					}
					else if(splitRoute[4] == "unlike"){
						var index = doc.likes.indexOf(req.user._id);
						if(index != -1) {
							doc.likes.splice(index, 1);
							exports.updateDevelop(doc, {}, fieldsToPopulate, req.user, developOptions, exports.handleResult(res));
							if(callback)
								callback(req.user, doc);
						} 
					}
					else{
						var ref = doc.schema.tree[splitUrl[4]] instanceof Array?doc.schema.tree[splitUrl[4]][0].ref:doc.schema.tree[splitUrl[4]].ref;
						//linked
						if(ref){
							if(ref == "File"){
								if(req.body.type == "base64"){
									var extension = req.body.extension?req.body.extension:"png";
									var name = uuid.v4()+"."+extension;
									var path = serverTmpFolderPath+name;
									var tmpFile = {name:name, path:path};
									var ws = fs.createWriteStream(path, {encoding:'base64'});
									ws.write(new Buffer(req.body.file, 'base64'));
									ws.end();
								}
								else{
									var tmpFile = req.files.file;
								}
										
								mongoose.model("File").createFile({
									tmpFile: tmpFile
								},
								function(err, file){
									exports.updateDevelop(file, req.body, fieldsToPopulate, req.user, developOptions, function(err, devFile){
										if(!err){
											if(doc.schema.tree[splitUrl[4]] instanceof Array)
												doc[splitUrl[4]].push(devFile);
											else
												doc[splitUrl[4]] = devFile;
											exports.update(doc, {}, function(err){
												if(req.body.type == "base64"){
													res.send(exports.objectToSend(err, devFile));
												}
												else{
													res.send('<html><body><textarea>'+JSON.stringify(devFile)+'</textarea></body></html>');
												}
												if(logActivity){
													console.log(req.user);
													mongoose.model('Activity').logAddToArray({type:splitUrl[3], ref:modelString, fieldsToPopulate:objectFieldsToPopulate}, req.user, {key:splitUrl[4], value:{type:file._id, ref:ref}});
												}
												if(callback)
													callback(req.user, doc, subdoc);
											});
										}
										else{
											res.send({success:false});
										}	
									});
								});
							}
							else{
								var subdocModel = mongoose.model(ref);
								var subdoc = new subdocModel({});
								/*exports.update(subdoc, req.body, function(err){
									if(!err){
										if(doc.schema.tree[splitUrl[4]] instanceof Array)
											doc[splitUrl[4]].push(subdoc);
										else
											doc[splitUrl[4]] = subdoc;
										exports.updateDevelop(doc, {}, fieldsToPopulate, req.user, developOptions, exports.handleResult(res));
									}
									else{
										res.send({success: false});	
									}
								});	*/
								exports.updateDevelop(subdoc, req.body, fieldsToPopulate, req.user, developOptions, function(err, suObj){
									if(!err){
										if(doc.schema.tree[splitUrl[4]] instanceof Array)
											doc[splitUrl[4]].push(subdoc);
										else
											doc[splitUrl[4]] = subdoc;
										exports.update(doc, {}, function(err){
											res.send(exports.objectToSend(err, suObj));
											if(logActivity){
												mongoose.model('Activity').logAddToArray({type:splitUrl[3], ref:modelString, fieldsToPopulate:objectFieldsToPopulate}, req.user, {key:splitUrl[4], value:{type:subdoc._id, ref:ref}});
											}
											if(callback)
												callback(req.user, doc, subdoc);
										});
									}
									else{
										res.send({success: false});	
									}
								});
							}
						}
						//embedded
						else{
							if(doc.schema.tree[splitUrl[4]] instanceof Array){
								doc[splitUrl[4]].push(req.body);
								var subdoc = doc[splitUrl[4]][doc[splitUrl[4]].length-1]; 
							}
							else{
								doc[splitUrl[4]] = req.body;
								var subdoc = doc[splitUrl[4]];
							}
							exports.update(doc, {}, function(err){
								if(!err){
									subdoc.develop(req.user, developOptions, function(err, subobj){
										exports.populateDevelopSubObjs(subobj, subdoc, fieldsToPopulate, req.user, developOptions, function(err){
											res.send(exports.objectToSend(err, subobj));
											if(logActivity){
												mongoose.model('Activity').logAddToArray({type:splitUrl[3], ref:modelString, fieldsToPopulate:objectFieldsToPopulate}, req.user, {key:splitUrl[4], value:subdoc._id});
											}
											if(callback)
												callback(req.user, doc, subdoc);
										});
									});
								}
								else{
									res.send({success: false});
								}
							});
						}
					}
				}
				else{
					res.send({success: false});	
				}
			});
		}
		if(splitRoute.length==6){
			model.findById(splitUrl[3], function(err, doc){
				if(!err){
					if(splitRoute[4] == "tags"){
						if(splitRoute[5] == "add"){
							req.body.tags.forEach(function(tag){
								doc.tags.push(tag);
								mongoose.model('Tag').getCreateTag(tag);
							});
							req.doc.save(function(err){
								if(!err){
									res.send({success: true});
								}
								else
									res.send({success: false});
							});
						}
						if(splitRoute[5] == "remove"){
							
						}
					}
				}
				else{
					res.send({success:false});
				}
			});
		}
		break;
		case "DELETE":
		if(splitRoute.length==3){
			model.remove({}, handleDelete);
		}
		if(splitRoute.length==4){
			model.findById(splitUrl[3], function(err, doc){
				if(!err){
					doc.remove(handleDelete);
				}
				else{
					res.send({success:false, msg:"Delete error."});
				}
			});
		}
		break;
	}
};

exports.handleResult = function(res, start){
	return function(err, object){
		if (err) {
			//get file msg
			res.send(600, {error:err});
		} else {
			res.send(exports.addJSONMetaData(object));
		}
	};
};

exports.objectToSend = function(err, object){
	if(!err){
		return exports.addJSONMetaData(object);
	}
	else{
		return err
		// console.log(err);
		// var errorToSend = {error:true};
		// if(typeof err == 'string')
		// 	errorToSend.msg = err;
		// }
		// return errorToSend;
	}
}

exports.loadResource = function(fieldsToPopulate){
	return function(req, res, next) {
		var splitUrl = req.url.split("?")[0].split("/");
		var adminOffset = splitUrl[1]=="adminapi"?1:0;
		var model = mongoose.model(exports.modelNameFromCollectionName(splitUrl[2+adminOffset]));
		if(splitUrl[3+adminOffset].match(new RegExp("^[0-9a-fA-F]{24}$")))
			var query = model.findById(splitUrl[3+adminOffset]);
		else
			var query = model.findOne({slug:splitUrl[3+adminOffset]});
		exports.attachQueryParams(query, req, fieldsToPopulate);
		query.exec(function(err, doc){
			if (!err && doc != null) {
				req.doc = doc;
				next();		
			} else {
				res.send({success:false, error:"id does not exist"});
			}
			
		});
	}
};

exports.extendBodyUserFields = function(userFields){
	return function(req, res, next) {
		userFields.forEach(function(userField){
			req.body[userField] = req.user;
		});
		next();
	}
};

exports.attachQueryParams = function(query, req, fieldsToPopulate){
	if(fieldsToPopulate)
		for(var i = 0; i < fieldsToPopulate.length; i++)
			query.populate(fieldsToPopulate[i]);
	
	if(req && req.query && req.query.sort_by)
		query.sort(req.query.sort_by);
	
	if(req && req.query && req.query.offset)
		query.skip(req.query.offset);
		
	if(req && req.query && req.query.limit)
		query.limit(req.query.limit);
};

exports.getQueryParamsFromRequest = function(model, req, fieldsToPopulate, additionalParams){
	var fullSearchParams = function(value) {
		var or = [];
		for(var sKey in model.schema.tree/*formattedSchema*/){
			var type = model.schema.tree[sKey].type?model.schema.tree[sKey].type.name:model.schema.tree[sKey].name;
			//var splitType = formattedSchema[sKey].type?formattedSchema[sKey].type.split("_"):formattedSchema[sKey].split("_");
			//var type = splitType.length==1?splitType[0]:splitType[1];
			var orItem = {};
			switch(type){
				case "String":
					orItem[sKey] = {$regex:value, $options: 'i'};
					or.push(orItem);
					break;
				case "Boolean":
					var bool = (typeof !!value === 'boolean') ? !!value : null;
					//var bool = (value=="true"||value==true)?true:(value=="false"||value==false)?false:null;
					if(bool != null){
						orItem[sKey] = bool;
						or.push(orItem);
					}
					break;
				case "Number":
					var parsedNumber = parseFloat(value);
					if(parsedNumber){
						orItem[sKey] = parsedNumber;
						or.push(orItem);
					}
					break;
			}
		}
		return or;
	};

	var queryParams = {};
	//var formattedSchema = exports.formattedSchema(model.schema.tree);
	for(var key in req.query){
		if(key != "sort_by" && key != "offset" && key != "limit" && key != "dojo.preventCache" && key != "in"){
			if(key == "*"){
				// var or = [];
				// for(var sKey in model.schema.tree/*formattedSchema*/){
				// 	var type = model.schema.tree[sKey].type?model.schema.tree[sKey].type.name:model.schema.tree[sKey].name;
				// 	//var splitType = formattedSchema[sKey].type?formattedSchema[sKey].type.split("_"):formattedSchema[sKey].split("_");
				// 	//var type = splitType.length==1?splitType[0]:splitType[1];
				// 	var orItem = {};
				// 	switch(type){
				// 		case "String":
				// 		orItem[sKey] = {$regex:req.query[key]};
				// 		or.push(orItem);
				// 		break;
				// 		case "Boolean":
				// 		var bool = req.query["*"]=="true"?true:req.query["*"]=="false"?false:null;
				// 		if(bool != null){
				// 			orItem[sKey] = bool;
				// 			or.push(orItem);
				// 		}
				// 		break;
				// 		case "Number":
				// 		var parsedNumber = parseFloat(req.query["*"]);
				// 		if(parsedNumber){
				// 			orItem[sKey] = parsedNumber;
				// 			or.push(orItem);
				// 		}
				// 		break;
				// 	}
				// }
				//queryParams["$or"] = or;
				queryParams["$or"] = fullSearchParams(req.query["*"]);
			}
			else{
				var type = model.schema.tree[key].type?model.schema.tree[key].type.name:model.schema.tree[key].name;
				//var splitType = formattedSchema[key].type?formattedSchema[key].type.split("_"):formattedSchema[key].split("_");
				//if(splitType){
					//var type = splitType.length==1?splitType[0]:splitType[1];
					switch(type) {
						case "String":
							if(key == "slug") {
								queryParams[key] = req.query[key]
							}
							else {
								queryParams[key] = {$regex:req.query[key], $options: 'i'};
							}
							break;
						case "Boolean":
							queryParams[key] = req.query[key] == "true";
							break;
						default:
							queryParams[key] = req.query[key];
							break;
					}
				//}	
			}	
		}
	}

	if(req.body.fullSearch) {
		queryParams["$or"] = fullSearchParams(req.body.fullSearch);
	}

	if(req.query.in) {
		queryParams._id = {"$in":JSON.parse(req.query.in)};
	}
	else if(req.body.inArray) {
		queryParams._id = {"$in":req.body.inArray};	
	}

	if(additionalParams) {
		for(var key in additionalParams){
			queryParams[key] = additionalParams[key];
		}
	}

	return queryParams;
}

exports.getQueryFromRequest = function(model, req, fieldsToPopulate, additionalParams){
	var queryParams = exports.getQueryParamsFromRequest(model, req, fieldsToPopulate, additionalParams);

	var query = model.find(queryParams);
	exports.attachQueryParams(query, req, fieldsToPopulate);
	return query;
}

exports.modelNameFromCollectionName = function(collectionName){
	for(var key in mongoose.models){
		if(mongoose.models[key].collection.name == collectionName)
			return mongoose.models[key].modelName;
	}
	return null;
}

exports.collectionNameFromModelName = function(modelName){
	if(mongoose.models[modelName])
		return mongoose.models[modelName].collection.name;
	else
		return null;
}

exports.formatSchema = function(schema, user, options, callback){
	exports.formatSchemaElement(schema, user, options, callback);
}

exports.formatSchemaElement = function(schemaElement, user, options, callback){
	if(schemaElement.tree){
		var formattedSchema = {};
		var keys = [];
		for(var key in schemaElement.tree)
			keys.push(key);
		async.forEach(keys, function(key, callback){
			exports.formatSchemaElement(schemaElement.tree[key], user, options, function(err, formattedSchemaElement){
				if(!err){
					if(formattedSchemaElement)
						formattedSchema[key] = formattedSchemaElement;
				}
				callback(err);
			});
		}, function(err){
			if(!err){
				if(typeof schemaElement.statics.adminMetaData == "function"){
					schemaElement.statics.adminMetaData(user, options, function(err, adminMetaData){
						if(!err){
							formattedSchema._meta2__ = adminMetaData;
						}
						callback(err, formattedSchema);
					});
				}
				else{
					formattedSchema._meta2__ = {};
					callback(null, formattedSchema);
				}
			}
			else{
				callback(err);	
			}
		});
	}
	//array
	else if(schemaElement instanceof Array){
		var formattedArray = [];
		async.forEach(schemaElement, function(arrayItem, callback){
			exports.formatSchemaElement(arrayItem, user, options, function(err, formattedArrayItem){
				if(!err){
					formattedArray.push(formattedArrayItem);
				}
				callback(err);
			});
		}, function(err){
			callback(err, formattedArray);
		});
	}
	else if(schemaElement.ref){
		callback(null, schemaElement.ref); 
	}
	else if(schemaElement.name){
		callback(null, schemaElement.name);
	}
	else if(schemaElement.type && schemaElement.type == "Meta"){
		callback(null, "Meta");
	}
	else if(schemaElement.type && schemaElement.type.name){
		callback(null, schemaElement.type.name);
	}
	else if(schemaElement.path){
		callback(null, null);
	}
	else if(schemaElement == "string"){
		callback(null, "String");
	}
	//simple dictionary
	else{
		var formattedDic = {};
		var keys = [];
		for(var key in schemaElement)
			keys.push(key);
		async.forEach(keys, function(key, callback){

			exports.formatSchemaElement(schemaElement[key], user, options, function(err, formattedSchemaElement){
				if(!err){
					if(formattedSchemaElement)
						formattedDic[key] = formattedSchemaElement;
				}
				callback(err);
			});
		}, function(err){
			callback(err, formattedDic);
		});
	}
}





exports.metaValidation = function(instance){
	var metaSchema = exports.getMetaModel(mongoose.model(instance.constructor.modelName).schema.tree);

	for(var key in metaSchema){
		var err = validateField(instance[key], metaSchema[key]);
		if (err) {
			return "error in field "+key;
		};
	}
	return true;
}

validateField =  function(value, meta){
	return meta.type in validationDict ? validationDict[meta.type](value, meta):true;
}

var validationDict = {
	email: function(value, meta) {
		return true;
	}, 
	mutliChoice: function(value, meta) {
		if  (meta.multiChoice) {
			return meta.choices.indexOf(value) === -1;
		};
		return null;
	}
};


/*
	type:   email
			multiChoice 	choices=["c1", "c2", ...]

*/


exports.getMetaModel = function(schemaElement){
	return exports.getMetaModelrecursive(schemaElement, true);
}

exports.getMetaModelrecursive = function(schemaElement, topLevel){

	if (isAFunction(schemaElement)) {
		var metaModel =  {type:schemaElement.name};
		appendDefaultFields(metaModel);
		return metaModel;
	};

	if (isAVirtualType(schemaElement)) {
		return null;
	};
	
	if (isAnObject(schemaElement)) {
		var metaModel = {};
		metaModel.meta = schemaElement.meta;
		if (!schemaElement.meta) {
			metaModel.meta = {};
		};
		if (schemaElement.type && !topLevel && isAFunction(schemaElement.type)) {
			metaModel.type = schemaElement.type.name;
			if (schemaElement.ref) {
				metaModel.ref =  schemaElement.ref;
			};
		} else {
			metaModel.type = "Object";
			metaModel.fields = {};
			for(var vkey in schemaElement){
				if (!(vkey === "meta")) {
					var rec = exports.getMetaModelrecursive(schemaElement[vkey], false);
					if (rec) {
						/* DEFAULT META KEY*/
						if (rec.meta && !rec.meta['metaKey']) {
							rec.meta['metaKey'] = vkey;
						};
						metaModel.fields[vkey] = rec;	
					};
				};
				if (vkey === "meta" && topLevel) {
					metaModel.meta = schemaElement[vkey];
				};
			}
		}
		appendDefaultFields(metaModel);

		return metaModel;
	}

	if (isAnArray(schemaElement)) {
		metaModel = {};
		metaModel.type = "Array";
		metaModel.content = [];
		for (var i = 0; i < schemaElement.length; i++) {
			var rec = exports.getMetaModelrecursive(schemaElement[i], false);
			if (rec) {
				metaModel.content = rec;	
			};
		};
		appendDefaultFields(metaModel);
		return metaModel;
	};
}


function appendDefaultFields(metaModel){

	if (!metaModel.meta) {
		metaModel.meta= {};
	};

	if (!metaModel.meta.optional) {
		metaModel.meta.optional = true;
	};

	if (!metaModel.meta.metaType && metaModel.type) {
		metaModel.meta.metaType = getDefaultMetaTypeForType(metaModel.type);
	};
}

function isAnObject(value){
	return Object.prototype.toString.call(value) === '[object Object]';
}

function isAnArray(value){
	return Object.prototype.toString.call(value) === '[object Array]';
}

function isAFunction(value){
	return Object.prototype.toString.call(value) === '[object Function]';
}

function isAVirtualType(value){
	return value.constructor.name === "VirtualType";
}


function getDefaultMetaTypeForType(type){
	if (!type) {
		return "Error";
	};
	switch (type){
		case "String":
			return "ShortString";
		break;

		case "Boolean":
			return "Boolean";
		default:
			return type;
			break;
	}
}


exports.getRecursiveField = function(obj, field){
	if(!obj)
		return null;
	var splitField = field.split('.');
	var toReturn = obj;
	splitField.forEach(function(fieldPart){
		if(toReturn)
			toReturn = toReturn[fieldPart];
	});
	return toReturn;
}

exports.setRecursiveField = function(obj, field, value){
	var splitField = field.split('.');
	var objToSet = obj;
	for(var i = 0; i < splitField.length-1; i++){
		objToSet = objToSet[splitField[i]];
		if(!objToSet)
			return;
	}
	objToSet[splitField[splitField.length-1]] = value;
}
	
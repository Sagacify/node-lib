// REFACTOR !!!
var async = require('async');

exports.cloneObject = function cloneObject(obj) {
  var clone = {};
  for(var i in obj) {
    if(typeof(obj[i])=="object")
      clone[i] = this.cloneObject(obj[i]);
    else
      clone[i] = obj[i];
  }
  return clone;
};

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
};


exports.capitalize = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.mongooseErrorHandler = function (err, req) {
  var errors = err.errors;
  for (var error in errors) {
    req.flash('error', errors[error].type);
  }
};

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
				limit : (limit) ? limit : 20,
				offset : (offset) ? offset : 0,
				total_count : json.length,
				},
			objects : json
			};
	}
	else
		return {
			meta : {
				codde : 200,
				total_count: 1
			},
			objects : json
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
	delete req.query['access_token'];
	
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
			console.log(arr[i]);
			console.log(req.query);
			console.log(arr[i] in req.query);
			if ((arr[i] in req.query)){
				console.log(arr[i]);
				continue;
			}
			else {
				next(new Error({ "error" : "query error", "message" : "Parameter(s) missing: " + missing_params.join(",") }));
			}
		}
		next();
	}
}

/* This function takes a piece of text and generate a first attempt to slug*/
exports.preprocessSlug = function preprocessSlug(text){
	if(!text)
		return text;
		
	var newSlug; 
	if(typeof text === "string"){
		newSlug = text.toLowerCase();
	}
	else{
		var att = "";
		for (att in text){
			break;
		}
		newSlug = text[att].toLowerCase();
	}
	 
	return newSlug.replace(/\s/g,"_");
}

exports.generateSlug = function generateSlug(me, modelMongo, baseSlug, slug, counter, next){

	var counter = counter + 1;
	me.model(modelMongo).find({place:me.place, slug:slug}).exec(function(err, items){
		if (!err) {
			console.log(items);
			if (items.length!=0){
				console.log("Slug is the same");
				exports.generateSlug(me, modelMongo, baseSlug, baseSlug+counter, counter, next);
			}
			else {
				console.log("Ready to save");
				me.slug = slug;
				next();
			}
		}
	});
}

exports.generateSlugForPlace = function(me, modelMongo, baseSlug, slug, counter, next){
	console.log("generate slug "+ slug);
	var counter = counter + 1;
	me.model(modelMongo).find({merchant:me.merchant, slug:slug}).exec(function(err, items){
		if (!err) {
			if (items.length!=0){
				console.log("Slug is the same");
				exports.generateSlugForPlace(me, modelMongo, baseSlug, baseSlug+counter, counter, next);
			}
			else {
				console.log("Ready to save");
				me.slug = slug;
				next();
			}
		}
	});
}

exports.addDefaultLanguage = function addDefaultLanguage(me, modelMongo, callback){
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

exports.genereateKeywords = function genereateKeywords(phrase){

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

//develop the doc and return the result in callback
/*exports.developDoc = function(doc, user, options, callback){
	if(!doc || !doc.develop)
		return callback(null, doc);
	doc.develop(user, options, callback);
}

//develop the docs and return the result in callback
exports.developDocs = function(docs, user, options, callback){
	var developedDocs = [];
	async.forEach(docs, function(doc, callback){
		exports.developDoc(doc, user, options, function(err, developedDoc){
			developedDocs.push(developedDoc);
			callback(err);
		});
	}, function(err){
		callback(err, developedDocs);
	});
}*/

exports.processedDoc = function(doc, virtualFields, deletedFields){
	var processedDoc = doc.toObject();
	
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
		async.forEach(arrDoc, function(doc, callback){
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

//develop subdocs of doc or array of docs
exports.developObjectSubdocs = function(object, developedObject, fieldsToDevelop, user, options, callback){
	
	/*if(developedObject instanceof Array){
		async.forEach(developedObject, function(developedDoc, callback){
			exports.developSubdocs(developedDoc, fieldsToDevelop, user, options, callback);
		}, function(err){
			callback(err);
		});
	}
	else{*/
		if(fieldsToDevelop == "auto"){
			fieldsToDevelop = [];
			var doc = object instanceof Array?object[0]:object;
			var developedDoc = developedObject instanceof Array?developedObject[0]:developedObject;
			for(var key in developedDoc)
				if(doc[key] && typeof doc[key].develop == "function")
					fieldsToDevelop.push(key);
		}
		
		async.forEach(fieldsToDevelop, function(fieldToDevelop, callback){
			if(developedObject[fieldToDevelop]){
				exports.developObject(object[fieldToDevelop], user, options[fieldToDevelop], function(err, developedSubdoc){
					if(!err)
						developedObject[fieldToDevelop] = developedSubdoc;
					callback(err)
				});
			}
			else{
				callback(null);
			}
		}, function(err){
			callback(err);
		});
	//}
}

/*exports.populateObject = function(object, fieldsToPopulate, user, options, callback){
	if(object instanceof Array){
		async.forEach(object, function(doc, callback){
			exports.populateObject(doc, fieldsToPopulate, user, options, callback);
		}, function(err){
			callback(err);
		});
	}
	else{
		var keys = [];
		for(var key in fieldsToPopulate)
			keys.push(key);
		async.forEach(keys, function(key, callback){
			var splitField = key.split('.');
			var subdocOptions = null;
			if(options && options[splitField[0]])
				subdocOptions = options[splitField[0]][splitField[1]];
				
			if(object[splitField[0]] instanceof Array){
				async.forEach(object[splitField[0]], function(doc, callback){
					mongoose.model(fieldsToPopulate[key]).findById(doc[splitField[1]], exports.develop(user, subdocOptions, function(err, subdoc){
						if(!err)
							doc[splitField[1]] = subdoc;
						callback(err);
					})); 
				}, function(err){
					callback(err);
				});
			}
			else{
				mongoose.model(fieldsToPopulate[key]).findById(object[splitField[0]][splitField[1]], exports.develop(user, subdocOptions, function(err, subdoc){
					if(!err)
						object[splitField[0]][splitField[1]] = subdoc;
					callback(err);
				})); 	
			}
		}, function(err){
			callback(err);
		});
	}
}*/

exports.populateDevelopSubObjs = function(arrObj, arrDoc, fieldsToPopulate, user, options, callback){
	if(arrObj instanceof Array){
		var tmp = 0;
		async.forEach(arrObj, function(obj, callback){
			var index = tmp;
			tmp++;
			exports.populateDevelopSubObjs(obj, arrDoc(index), fieldsToPopulate, user, options, callback);
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
				else{
					mongoose.model(doc.schema.tree[childField][0].ref).find({_id:obj[childField]}, exports.populateDevelop(grandChildFields, user, subOptions, function(err, subArrObj){
						if(!err)
							obj[childField] = subArrObj;
						callback(err);
					}));	
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
				else{
					mongoose.model(doc.schema.tree[childField].ref).findById(obj[childField], exports.populateDevelop(grandChildFields, user, subOptions, function(err, subObj){
						if(!err)
							obj[childField] = subObj;
						callback(err);
					}));
				}
			}
		}, function(err){
			callback(err);
		});
	}
};

/*exports.populateDevelop = function(fieldsToPopulate, user, options, callback){
	return function(err, arrDoc){
		if(err) return callback(err);
		if(!arrDoc) return callback(null, null);

		exports.developArrDoc(arrDoc, user, options, function(err, developedArrObj){
			if(!err){
				exports.populateObject(developedArrObj, fieldsToPopulate, user, options, function(err){
					callback(err, developedArrObj);
				});	
			}
			else
				callback(err);
		});
	}
}*/

exports.populateDevelop = function(fieldsToPopulate, user, options, callback){
	return function(err, arrDoc){
		if(err) return callback(err);
		if(!arrDoc) return callback(null, null);

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
}

exports.develop = function(user, options, callback){
	return exports.populateDevelop([], user, options, callback);
}

exports.update = function(doc, params, callback){
	var ImageModel = mongoose.model("Image");
	var images = {};
	var keys = [];
	for(var key in params)
		if(doc[key] != params[key])
			keys.push(key);
	async.forEach(keys, function(key, callback){
		if(doc.schema.tree[key] && doc.schema.tree[key].ref == "Image"){
			if(doc[key]!=params[key]||doc[key]._id!=params[key]){
				/*ImageModel.findById(params[key], function(err, image){
					if(!err && image) {
						image.tmp = false;
						image.thumb(function(err){
							doc[key] = image;
							callback(err);
						});
					}
					else
						callback(err);					
				});*/
				ImageModel.preAttachProcess(params[key], callback);
			}
			else{
				callback(null);
			}
		}
		else{
			doc[key] = params[key];
			callback(null);
		}
	}, function(err){
		doc.save(callback);
	});
}

exports.updateDevelop = function(doc, params, fieldsToPopulate, user, options, callback){
	exports.update(doc, params, function(err){
		if(!err){
			var query = mongoose.model(doc.collection.name).findById(doc._id);
			if(fieldsToPopulate)
				for(var i = 0; i < fieldsToPopulate.length; i++)
					query.populate(fieldsToPopulate[i]);
			query.exec(exports.populateDevelop(fieldsToPopulate, user, options, callback));
		}
		else
			console.log(err);
	});
}

exports.automatic = function(modelString, fieldsToPopulate, developOptions){
	return function(req, res) {
		var model = mongoose.model(modelString);
		if(fieldsToPopulate)
			for(var i = 0; i < fieldsToPopulate.lenght; i++)
				req.populate(fieldsToPopulate[i]);
		var handleResult = function(err, object){
			if(!err){
				res.send(exports.addJSONMetaData(object));
			}
			else{
				res.send({success: false});
			}
		}
		var splitRoute = req.route.path.split("/");
		var splitUrl = req.url.split("/");
		switch(req.method){
			case "GET":
			if(splitRoute.length==3)
				var query = model.find({});
			if(splitRoute.length==4)
				var query = model.findById(splitUrl[3]);
			if(fieldsToPopulate)
				for(var i = 0; i < fieldsToPopulate.length; i++)
					query.populate(fieldsToPopulate[i]);
			query.exec(exports.populateDevelop(fieldsToPopulate, req.user, developOptions, handleResult));
			break;
			case "PUT":
			if(splitRoute.length==4){
				model.findById(splitUrl[3], function(err, doc){
					if(!err){
						exports.updateDevelop(doc, req.body, fieldsToPopulate, req.user, developOptions, handleResult);
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
				exports.updateDevelop(doc, req.body, fieldsToPopulate, req.user, developOptions, handleResult);
			}
			break;
			case "DELETE":
			break;
		}
	}
}
/*
exports.findFromCollection = function(collection, query, callback){
	collection.find(query, function(err, cursor){
		if(!err){
			rep.toArray(function(err, items){
				if(query._id)
					callback(err, items[0])
				else
					callback(err, items);				
			});
		}
		else{
			callback(err);
		}
	});	
}*/

var develop = require('./develop');

exports.generateFromURI = function(fieldsToPopulate, developOptions, callback){
	return function(req, res) {
		exports.handleResultFromURI(req, res, fieldsToPopulate, developOptions, callback);
	};
};

exports.handleResultFromURI = function(req, res, fieldsToPopulate, developOptions, callback){
	var handleDelete = function(err){
		if(!err){
			res.sendMeta({success: true});
		}
		else{
			res.sendMeta(new SGError());
		}
	}
	var splitRoute = req.route.path.split("/");
	var splitUrl = req.url.split("?")[0].split("/");
	var modelString = mongoose.modelNameFromCollectionName(splitRoute[2]);
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
				var query = req.getFindQuery(model, fieldsToPopulate);
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
								res.sendMeta(err||arrObj);
							});	
						}
						else
							res.sendMeta(err);
						if(callback)
							callback(req.user, doc);
					});
				}
				else{
					res.sendMeta(err);
				}
			});
		}
		break;
		case "PUT":
		if(splitRoute.length==4){
			model.findById(splitUrl[3], function(err, doc){
				if(!err){
					doc.updateDevelop(req.body, fieldsToPopulate, req.user, developOptions, res.handle());
					if(callback)
						callback(req.user, doc);
				}
				else{
					res.sendMeta(err);		
				}
			});
		}
		break;
		case "POST":
		if(splitRoute.length==3){
			var doc = new model({});
			doc.updateDevelop(req.body, fieldsToPopulate, req.user, developOptions, res.handle());
			if(callback)
				callback(req.user, doc);
		}
		if(splitRoute.length==5){
			model.findById(splitUrl[3], function(err, doc){
				if(!err){
					if(splitRoute[4] == "like"){
						if(doc.likes.indexOf(req.user._id) == -1)
							doc.likes.push(req.user._id);
						doc.updateDevelop({}, fieldsToPopulate, req.user, developOptions, res.handle());
						if(callback)
							callback(req.user, doc);
					}
					else if(splitRoute[4] == "unlike"){
						var index = doc.likes.indexOf(req.user._id);
						if(index != -1) {
							doc.likes.splice(index, 1);
							doc.updateDevelop({}, fieldsToPopulate, req.user, developOptions, res.handle());
							if(callback)
								callback(req.user, doc);
						} 
					}
					else{
						var ref = doc.schema.tree[splitUrl[4]] instanceof Array?doc.schema.tree[splitUrl[4]][0].ref:doc.schema.tree[splitUrl[4]].ref;
						//linked
						if(ref){
							var subdocModel = mongoose.model(ref);
							var subdoc = new subdocModel({});
							subdoc.updateDevelop(req.body, fieldsToPopulate, req.user, developOptions, function(err, subObj){
								if(!err){
									if(doc.schema.tree[splitUrl[4]] instanceof Array)
										doc[splitUrl[4]].push(subdoc);
									else
										doc[splitUrl[4]] = subdoc;
									doc.update({}, function(err){
										res.sendMeta(err||subObj);
										if(callback)
											callback(req.user, doc, subdoc);
									});
								}
								else{
									res.sendMeta(err);	
								}
							});
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
							doc.update({}, function(err){
								if(!err){
									subdoc.develop(req.user, developOptions, function(err, subobj){
										develop.populateDevelopSubObjs(subobj, subdoc, fieldsToPopulate, req.user, developOptions, function(err){
											res.sendMeta(err||subobj);
											if(callback)
												callback(req.user, doc, subdoc);
										});
									});
								}
								else{
									res.sendMeta(err);
								}
							});
						}
					}
				}
				else{
					res.sendMeta(err);	
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
					res.sendMeta(err);
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
					res.sendMeta(new SGError());
				}
			});
		}
		break;
	}
};

exports.loadResource = function(fieldsToPopulate, slug){
	return function(req, res, next) {
		var splitUrl = req.url.split("?")[0].split("/");
		var adminOffset = splitUrl[1]=="adminapi"?1:0;
		var model = mongoose.model(mongoose.modelNameFromCollectionName(splitUrl[2+adminOffset]));
		if(!slug)
			var query = model.findById(splitUrl[3+adminOffset]);
		else
			var query = model.findOne({slug:splitUrl[3+adminOffset]});
		query.attachRequestParams(req);
		query.attachPopulates(fieldsToPopulate);
		query.exec(function(err, doc){
			if (!err && doc != null) {
				req.doc = doc;
				next();		
			} else {
				res.send(err);
			}
			
		});
	}
};
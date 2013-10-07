require('../develop/model');

/* TODO
*	handle dic in doc
*/

exports.handle = function(options){
	options = options||{};
	return function(req, res){
		var context = {req:req, user:req.user, scope:options.scope};

		//path is the route specified in our constroller, e.g. /api/users/:id
		var splitPath = req.route.path.split('/');
		splitPath.popFirst();
		splitPath.popFirst();
		if(!splitPath.last())
			splitPath.pop();

		//url is the actual uri specified by the client, e.g. /api/users/5232c14e65521a0000000001
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
				console.log(err);
				console.log(err.stack)
				res.SGsend(err);
			}
		}

		if(splitPath.length == 0){
			//get directly from collection
			if(req.method == "GET"){
				model.process._apply(model, req.mixin, callback);
			}
			//create directly in collection
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
					//get doc or collection
					if(req.method == "GET"){
						callback(null, collDoc);
					}
					//update doc or collection
					else if(req.method == "PUT"){
						var caller = collDoc instanceof Array?collDoc.model:collDoc;
						caller.sgUpdate.apply(collDoc, [req.mixin, callback]);
					}
					//remove doc or collection
					else if(req.method == "DELETE"){
						var caller = collDoc instanceof Array?collDoc.model:collDoc;
						caller.sgRemove.apply(collDoc, [callback]);
					}
					else{
						console.log("er")
						//callback(new SGError());
					}
					return;
				}
				if(collDoc instanceof Array && collDoc[0]){
					collDoc.modelName = collDoc[0].getModelName();
					collDoc.model = collDoc[0].getModel();
				}

				var pathPart = splitPath.popFirst();
				var urlPart = splitUrl.popFirst();

				//urlPart is not a variable
				if(pathPart == urlPart){
					var caller = (collDoc instanceof Array)?collDoc.model:collDoc;
					var call = function(){
						//action on doc or coll
						if(req.method == "POST" && splitUrl.length == 0 && typeof caller[urlPart] == "function"){
							caller.do.apply(collDoc, [urlPart, req.mixin, callback]);
						}
						//create doc in array 
						else if(req.method == "POST" && splitUrl.length == 0 && collDoc instanceof mongoose.Document && collDoc[urlPart] instanceof Array){
							//creation of a doc in a documentArray: the data is simply pushed in the array, then document containing the array is saved
							if(collDoc[urlPart] instanceof mongoose.Types.DocumentArray){
								collDoc[urlPart].push(req.body.doc);
								collDoc.save(callback);
							}
							//creation of a doc in a referenceArray: the doc is first created in the collection, then its id is pushed in the array
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
							//push of a simple item in the array
							else{
								collDoc[urlPart].push(req.body.item);
								collDoc.save(callback);
							}
						}
						//delete simple type or reference from array
						// !caller[urlPart]
						else if(req.method == "DELETE" && splitUrl.length == 1 && collDoc instanceof mongoose.Document && collDoc[urlPart] instanceof Array && !(collDoc[urlPart] instanceof mongoose.Types.DocumentArray) && splitUrl[0] != splitPath[0]){
							collDoc[urlPart].sgRemove(splitUrl[0]);
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
					
					var schemaTree;
					if(caller instanceof mongoose.Document)
						schemaTree = caller.getModel().schema.tree;
					if(schemaTree && schemaTree[urlPart] && schemaTree[urlPart].ref && !caller.populated(urlPart)){
						caller.populate(urlPart, function(err){
							call();
						});
					}
					else{
						call();
					}
				}
				//if next route path part is an id, the doc is retrieved from an array of embedded document or the model
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
				//if next route part is a variable but not an id, it is used as a filter on the collection
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
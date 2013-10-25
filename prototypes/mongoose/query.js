mongoose.Query.prototype._exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = function exec(op, callback){
	var me = this;
	if(this.options.populateDevelop){
		var popDev = function(err, arrDoc){
			if(arrDoc){
				arrDoc.context = me.options.populateDevelop.context;
				arrDoc.populateDevelop(function(err, popDevArrDoc){
					if(me.options.cache){
						if(me.options.cache.list){
							redisClient.setList(me.options.cache.list.collection, me.options.cache.list.name, devCollDoc);
						}
						else{
							redisClient.setDocument(arrDoc.getModel().collection.name, arrDoc.id, me.options.populateDevelop.context.scope, devCollDoc);
						}
					}
					op(err, popDevArrDoc);
				});
			}
			else{
				op(err);
			}
		}

		if(this.options.cache){
			if(this.options.cache.list){
				redisClient.getList(this.options.cache.list.collection, this.options.cache.list.name, this.options.populateDevelop.context.scope, function(err, result){
					if(result){
						callback(null, result);
					}
					else{
						me._exec(popDev, callback);
					}
				});  
			}
			else{
				redisClient.getDocument(this.model.collection.name, this._conditions._id, this.options.populateDevelop.context.scope, function(err, result){
					if(result){
						callback(null, result);
					}
					else{
						me._exec(popDev, callback);
					}
				});  
			}
		}
		else{
			me._exec(popDev, callback);
		}
	}
	else if(this.options.cache){

	}
	// else if(this.options.cache && this.op == "find" && this._conditions){
	// 	var namespace = this.model.collection.name;
	// 	var key = this._conditions._id?this._conditions._id:JSON.stringify(this._conditions);
	// 	redisClient.get(namespace, key, function(err, redisRes){
	// 		if(!redisRes){
	// 			me._exec(function(err, mongoRes){
	// 				op(err, mongoRes);
	// 				redisClient.set(namespace, key, JSON.stringify(mongoRes));
	// 			}, callback);
	// 		}
	// 		else{
	// 			op(null, JSON.parse(redisRes));
	// 		}
	// 	});
	// }
	// else if(this.options.develop){
 //    	this._exec(develop.populateDevelop(this.options.develop.fields, this.options.develop.user, this.options.develop.options, op), callback);
 //    }
    else{
    	this._exec(op, callback);
    }
};

// mongoose.Query.prototype.develop = function develop(fields, user, options){
// 	this.options.develop = {
// 		fields: fields,
// 		user: user,
// 		options: options
// 	};
// 	return this;
// };

mongoose.Query.prototype.populateDevelop = function populateDevelop(context){
	this.options.populateDevelop = {
		context: context
	};
	return this;
};

mongoose.Query.prototype.cache = function cache(options){
	if(options){
		this.options.cache = {
			list: options.list,
			key: options.key,
			ttl: options.ttl||1*hour
		};
	}
	return this;
};

mongoose.Query.attachRequestParams = function(req){
	if(req && req.query && req.query.sort_by)
		this.sort(req.query.sort_by);
	
	if(req && req.query && req.query.offset)
		this.skip(req.query.offset);
		
	if(req && req.query && req.query.limit)
		this.limit(req.query.limit);

	return this;
};

mongoose.Query.attachPopulates = function(fieldsToPopulate){
	if(fieldsToPopulate){
		fieldsToPopulate.forEach(function(fieldToPopulate){
			this.populate(fieldToPopulate);
		});
	}
	return this;
};
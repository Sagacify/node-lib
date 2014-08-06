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
    else{
    	this._exec(op, callback);
    }
};

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

mongoose.Query.prototype._limit = mongoose.Query.prototype.limit;

mongoose.Query.prototype.limit = function limit(limit){
	return this._limit(Math.min(limit, 100));
};

mongoose.Query.prototype.paginate = function paginate(paginate){
	return this.skip(paginate.offset).limit(paginate.limit);
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
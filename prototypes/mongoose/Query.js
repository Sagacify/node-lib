var develop = require('../../develop');

mongoose.Query.prototype._exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = function exec(op, callback){
	var me = this;
	if(this.options.cache && this.op == "find" && this._conditions){
		var namespace = this.model.collection.name;
		var key = this._conditions._id?this._conditions._id:JSON.stringify(this._conditions);
		redisClient.get(namespace, key, function(err, redisRes){
			if(!redisRes){
				me._exec(function(err, mongoRes){
					op(err, mongoRes);
					redisClient.set(namespace, key, JSON.stringify(mongoRes));
				}, callback);
			}
			else{
				op(null, JSON.parse(redisRes));
			}
		});
	}
	else if(this.options.develop){
    	this._exec(develop.populateDevelop(this.options.develop.fields, this.options.develop.user, this.options.develop.options, op), callback);
    }
    else{
    	this._exec(op, callback);
    }
};

mongoose.Query.prototype.develop = function develop(fields, user, options){
	this.options.develop = {
		fields: fields,
		user: user,
		options: options
	};
	return this;
};

mongoose.Query.prototype.cache = function cache(key){
	this.options.cache = {

	};
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
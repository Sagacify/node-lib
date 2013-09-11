var develop = require('../../develop')

mongoose.Query.prototype.develop = function develop(){
	this.options.develop = true;
	this.options.fields = arguments[0];
	this.options.user = arguments[1];
	this.options.options = arguments[2];
	return this;
};

mongoose.Query.prototype._exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = function exec(op, callback){
	if(this.options.develop){
    	this._exec(develop.populateDevelop(this.options.fields, this.options.user, this.options.options, op), callback);
    }
    else{
    	this._exec(op, callback);
    }
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
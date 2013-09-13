mongoose.Model.prototype.getCreationDate = function() {
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



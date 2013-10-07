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
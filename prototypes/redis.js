redisClient._get = redisClient.get;

redisClient.get = function(namespace, key, callback){
	if(arguments.length == 3 && typeof key == "string"){
		this._get(namespace + "_" + key, callback);
	}
	else{
		this._get(arguments[0], arguments[1]);
	}
};

redisClient._set = redisClient.set;

redisClient.set = function(namespace, key, callback){
	if(arguments.length == 3 && typeof key == "string"){
		this._set(namespace + "_" + key, callback);
	}
	else{
		this._set(arguments[0], arguments[1]);
	}
};
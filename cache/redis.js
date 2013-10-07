var keyForArgs = function(args){
	var key;
	if(args && args.isString()){
		var key = args;
	}
	if(args && args.isArray()){
		var key = "";
		args.forEach(function(keyPart, i){
			key += keyPart;
			if(i != args.length-1)
				key += ":";
		});
		this._get(args, callback);
	}
	return key;
}

redisClient._get = redisClient.get;

redisClient.get = function(keyArgs, callback){
	if(arguments.length > 2){
		var keyArgs = [];
		for(var i = 0; i < arguments.length-1; i++)
			keyArgs.push(arguments[i]);
		var callback = arguments.last();
	}
	this._get(keyForArgs(keyArgs), callback);
};

redisClient._set = redisClient.set;

redisClient.set = function(keyArgs, value, callback){
	if(arguments.length > 3){
		var keyArgs = [];
		for(var i = 0; i < arguments.length-2; i++)
			keyArgs.push(arguments[i]);
		var value = arguments[arguments.length-2];
		var callback = arguments.last();
	}
	this._set(keyForArgs(keyArgs), value, callback);
};

redisClient.mhgetall = function(keys, callback){
	var multi = this.multi();
	keys.forEach(function(key){
		multi.hgetall(key);
	});
	multi.exec(callback);
};
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

redisClient.getDocument = function(collection, key, scope, callback){
	var key;
	if(arguments.length == 4){
		key = collection+":"+key+":"+scope;
	}
	if(arguments.length == 3){
		key = collection+":"+key;
		callback = scope;
	}
	if(arguments.length == 2){
		key = collection;
		callback = key;
	}

	this.hgetall(key, callback);
};

redisClient.getList = function(collection, name, scope, callback){
	var key;
	if(arguments.length == 4){
		key = collection+":"+name;
	}
	if(arguments.length == 3){

	}
	var me = this;
	this.get(key, function(err, list){
		if(list){
			var scopedKeys = [];
			for(var key in list){
				scopedKeys.push(scope?(key+":"+scope):key);
			}
			me.mhgetall(scopedKeys, callback);
		}
		else{
			callback(err);
		}
	});
};

redisClient.setDocument = function(collection, key, scope, devDoc, callback){
	var key;
	if(arguments.length == 5 && callback || arguments.length == 4){
		key = collection+":"+key+":"+scope;
	}
	if(arguments.length == 4 && callback || arguments.length == 3){
		key = collection+":"+key;
		callback = scope;
	}
	if(arguments.length == 3 && callback || arguments.length == 2){
		key = collection;
		callback = key;
	}
	this.hmset(key, devDoc);
};

redisClient.setList = function(collection, name, callback){
	var key;
	if(arguments.length == 3){
		key = collection+":"+name;
	}

	// TODO
};
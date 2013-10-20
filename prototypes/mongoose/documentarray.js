mongoose.Types.DocumentArray.prototype.add = function(value, options, callback){
	if(typeof options == "function"){
		callback = options;
	}
	//semiEmbedded
	if(this._schema.schema.tree._id.ref){
		this.addSemiEmbedded.apply(this, arguments);
	}
	else{
		if(!options || options.duplicate || !me.contains(value._id)){
			this.push(value);
		}
		if(callback)
			callback(null, value);
	}
};

mongoose.Types.DocumentArray.prototype.addSemiEmbedded = function(value, options, callback){
	if(typeof options == "function"){
		callback = options;
	}
	var me = this;
	var add = function(doc){
		var semiEmbedded = {};
		me._schema.schema.tree.keys().forEach(function(key){
			semiEmbedded[key] = doc[key];
		});
		if(!options || options.duplicate || !me.contains(doc._id)){
			me.push(semiEmbedded);
		}
	}

	if(value instanceof Object){
		add(value);
		if(callback)
			callback(null, value);
	}
	else{
		model(this._schema.schema.tree._id.ref).findById(value, function(err, doc){
			if(doc){
				add(doc);
			}
			if(callback)
				callback(err, doc);
		});
	}
};
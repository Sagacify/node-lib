mongoose.Schema.prototype.isPublic = function(path){
	return this.paths[path].options.public||(this.paths[path].caller&&this.paths[path].caller.options.public)||(this.paths[path].caster&&this.paths[path].caster.options&&this.paths[path].caster.options.public);
};

mongoose.Schema.prototype.setPublic = function(path, public){
	this.paths[path].options.public = public;
};

mongoose.Schema.prototype.isSingle = function(path){
	return this.paths[path].options.single;
};

mongoose.Schema.prototype.setSingle = function(path, single){
	this.paths[path].options.single = single;
};

mongoose.Schema.prototype.publicFormat = function(modelName){
	var publicFormat = {doc:{tree:{}, virtuals:{}, actions:{}, modelName:modelName}, collection:{virtuals:{}, actions:{}}};

	var publicSpec = function(spec){
		if(spec.options.geoindex){
			return [{type:'Number'}];
		}
		if(spec.options.type instanceof Array)
			var publicSpec = [{type:spec.options.type[0].type.name, ref:spec.options.type[0].ref}];	
		else
			var publicSpec = {type:spec.options.type.name, ref:spec.options.ref};
		return publicSpec;
	};

	var publicVirtualActionSpec = function(virtualActionSpec){
		var publicSpec;
		if(virtualActionSpec instanceof Array){
			publicSpec = [{type: virtualActionSpec[0].type, ref: virtualActionSpec[0].ref}];
		}
		else{
			publicSpec = {type: virtualActionSpec.type, ref: virtualActionSpec.ref};
		}
		return publicSpec;
	};

	for(var path in this.paths){
		if(path == "_id" || this.isPublic(path)){
			var spec = this.paths[path];
			if(spec.schema){
				publicFormat.doc.tree[path] = [spec.schema.publicFormat()];
				if(this.isSingle(path))
					publicFormat.doc.tree[path][0].single = true;
			}
			// else if(spec.caster/* && !(spec.options.type instanceof Array)*/){
			// 	publicFormat.doc.tree[path] = [publicSpec(spec.caster)];
			// }
			else{
				console.log(publicFormat.doc);
				publicFormat.doc.tree[path] = publicSpec(spec);
			}
		}
	}

	for(var path in this.documentVirtuals){
		var publicCheck = this.documentVirtuals[path] instanceof Array?this.documentVirtuals[path][0]:this.documentVirtuals[path];
		if(publicCheck.public)
			publicFormat.doc.virtuals[path] = publicVirtualActionSpec(this.documentVirtuals[path]);
	}

	for(var path in this.documentActions){
		var publicCheck = this.documentActions[path] instanceof Array?this.documentActions[path][0]:this.documentActions[path];
		if(publicCheck.public)
			publicFormat.doc.actions[path] = publicVirtualActionSpec(this.documentActions[path]);
	}

	for(var path in this.collectionVirtuals){
		var publicCheck = this.collectionVirtuals[path] instanceof Array?this.collectionVirtuals[path][0]:this.collectionVirtuals[path];
		if(publicCheck.public)
			publicFormat.collection.virtuals[path] = publicVirtualActionSpec(this.collectionVirtuals[path]);
	}

	for(var path in this.collectionActions){
		var publicCheck = this.collectionActions[path] instanceof Array?this.collectionActions[path][0]:this.collectionActions[path];
		if(publicCheck.public)
			publicFormat.collection.actions[path] = publicVirtualActionSpec(this.collectionActions[path]);
	}

	return publicFormat;
};
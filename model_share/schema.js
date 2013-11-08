mongoose.Schema.prototype.isPublic = function(path){
	return this.paths[path].options.public||(this.paths[path].caller&&this.paths[path].caller.options.public);
};

mongoose.Schema.prototype.setPublic = function(path, public){
	this.paths[path].options.public = public;
};

mongoose.Schema.prototype.publicFormat = function(){
	var publicFormat = {doc:{tree:{}, virtuals:{}, actions:{}}, collection:{virtuals:{}, actions:{}}};

	var publicSpec = function(spec){
		var publicSpec = {type:spec.instance};
		if(spec.options.ref)
			publicSpec.ref = spec.options.ref;
		return publicSpec;
	}

	var publicVirtualActionSpec = function(virtualActionSpec){
		var publicSpec = {type: virtualActionSpec.type};
		return publicSpec;
	}

	for(var path in this.paths){
		if(path=="_id" || this.isPublic(path)){
			var spec = this.paths[path];
			if(spec.schema){
				publicFormat.doc.tree[path] = [spec.schema.publicFormat()];
			}
			else if(spec.caster){
				publicFormat.doc.tree[path] = [publicSpec(spec.caster)];
			}
			else{
				publicFormat.doc.tree[path] = publicSpec(spec);
			}

			// if(spec.schema){
			// 	publicFormat.doc.tree._set(path, spec.schema.publicFormat());
			// }
			// else if(spec.caster){
			// 	publicFormat.doc.tree._set(path, publicSpec(spec.caster));
			// }
			// else{
			// 	publicFormat.doc.tree._set(path, publicSpec(spec));
			// }
		}
	}

	for(var path in this.documentVirtuals){
		if(this.documentVirtuals[path].public)
			publicFormat.doc.virtuals[path] = publicVirtualActionSpec(this.documentVirtuals[path]);
	}

	for(var path in this.documentActions){
		if(this.documentActions[path].public)
			publicFormat.doc.actions[path] = publicVirtualActionSpec(this.documentActions[path]);
	}

	for(var path in this.collectionVirtuals){
		if(this.collectionVirtuals[path].public)
			publicFormat.collection.virtuals[path] = publicVirtualActionSpec(this.collectionVirtuals[path]);
	}

	for(var path in this.collectionActions){
		if(this.collectionActions[path].public)
			publicFormat.collection.actions[path] = publicVirtualActionSpec(this.collectionActions[path]);
	}

	return publicFormat;
};
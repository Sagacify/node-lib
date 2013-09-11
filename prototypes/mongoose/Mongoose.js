mongoose.Mongoose.prototype.modelNameFromCollectionName = function(collectionName){
	for(var key in this.models){
		if(this.models[key].collection.name == collectionName)
			return this.models[key].modelName;
	}
	return null;
};

mongoose.Mongoose.prototype.collectionNameFromModelName = function(modelName){
	if(this.models[modelName])
		return this.models[modelName].collection.name;
	else
		return null;
}
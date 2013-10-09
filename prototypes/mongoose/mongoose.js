mongoose.Mongoose.prototype.modelNameFromCollectionName = function(collectionName){
	return this.getModelsByCollection()[collectionName];
};

mongoose.Mongoose.prototype.collectionNameFromModelName = function(modelName){
	if(this.models[modelName])
		return this.models[modelName].collection.name;
	else
		return null;
}

mongoose.getModelsByCollection = function(){
	if(!mongoose.modelsByCollection){
		mongoose.modelsByCollection = {};
		mongoose.models.keys().forEach(function(modelKey){
			var model = mongoose.models[modelKey];
			mongoose.modelsByCollection[model.collection.name] = modelKey;
		});
	}
	return mongoose.modelsByCollection;
};
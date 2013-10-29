var ModelState = function(collectionName) {
	this.modelName =  mongoose.modelNameFromCollectionName(collectionName);
}

ModelState.prototype.modelName = String, 
ModelState.prototype.getModel = function(){
	this.model = mongoose.model(this.getModelName());;	
}


State.prototype.getNextState = function(callback){
	var nextValue = this.hasNext()
	if (!this.hasNext()) {
		//Specific task
		return null;
	};

	//ID?


}
var IDState = function(id, model) {
	this.id = id;
	this.model = model;
}

State.prototype.getNextState = function(callback){
	var nextValue = this.hasNext()
	if (!this.hasNext()) {
		//Specific task
		return null;
	};

	switch(this.getHttpMethod()){
		case 'PUT':
			//
			break;
		case 'GET':
			//
			break;
		case 'POST':
			//
			break;
	}
}
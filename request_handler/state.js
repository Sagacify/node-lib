var State = function(){

}
State.prototype.context = {request:{httpMethod:"GET"}};
State.prototype.previousResult = null;
State.prototype.getHttpMethod = function(){
	return this.context.request.httpMethod;
}
State.prototype.path = [];
State.prototype.index = 0;

State.prototype.validateIndex = function(){
	if (this.index>0) {
		return false;
	};
	if (this.index>=this.path.length) {
		return false
	};
	return true;
}

State.prototype.hasNext = function(){
	if (this.validateIndex()) {
		return false;
	};
	if (this.index == this.path.length-1) {
		return false;
	};
	return this.path[this.index+1];
}


State.prototype.getNextState = function(callback){
	if (!this.hasNext()) {
		return null;
	};

}

// State.prototype.computeState = function(callback) {
// 	if (this.hasNext) {
// 		var nextState = this.getNextState();
// 		nextState.computeState(callback);
// 	};
// 	callback(null);
// 	//Override me...
// }

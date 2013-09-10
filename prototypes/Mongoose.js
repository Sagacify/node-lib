var develop = require('../develop')

mongoose.Query.prototype.develop = function develop(){
	this.options.fields = arguments[0];
	this.options.user = arguments[1];
	this.options.options = arguments[2];
	return this;
};

mongoose.Query.prototype.exec2 = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = function exec(op, callback){
    this.exec2(develop.populateDevelop(this.options.fields, this.options.user, this.options.options, op), callback);
};
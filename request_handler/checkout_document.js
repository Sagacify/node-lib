function CheckoutDocument(context, route){
	this.context = context;
	this.route = route;
	this.state = route.states.last();
	this.doc = this.state.obj;
};

CheckoutDocument.prototype.get = function(callback){
	callback(null, this.doc);
};

CheckoutDocument.prototype.post = function(callback){
	callback(new SGError());
};

CheckoutDocument.prototype.put = function(callback){
	console.log("doc put")
	this.doc.sgUpdate.apply(this.doc, [this.context.req.body, callback]);
};

CheckoutDocument.prototype.delete = function(callback){
	this.doc.sgRemove(callback);
};

module.exports = CheckoutDocument;
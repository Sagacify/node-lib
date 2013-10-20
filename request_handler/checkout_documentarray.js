var async = require('async');

function CheckoutDocumentArray(context, route){
	this.context = context;
	this.route = route;
	this.state = route.states.last();
	this.parentState = this.state.parentState();
	this.docArray = this.state.obj;
};

CheckoutDocumentArray.prototype.get = function(callback){
	callback(null, this.docArray);
};

CheckoutDocumentArray.prototype.post = function(callback){
	var me = this;
	if(this.parentState.state.type() == "Document"){
		this.parentState.state.obj.add(this.parentState.path, this.context.req.body, function(err, added){
			if(!err){
				me.parentState.state.obj.save(function(err){
					callback(err, added);
				});
			}
			else{
				callback(err);
			}
		});
	}
	else{
		callback(new SGError());
	}
};

CheckoutDocumentArray.prototype.put = function(callback){
	var me = this;
	async.each(this.docArray, function(doc, callback){
		doc.set(this.context.req.body, callback);
	}, function(err){
		if(!err){
			this.parentState.state.obj.save(function(err){
				callback(err, me.docArray);
			});
		}
		else{
			callback(err);
		}
	});
};

CheckoutDocumentArray.prototype.delete = function(callback){
	this.docArray.splice(0, this.docArray.length);
	var me = this;
	this.parentState.state.obj.save(function(err){
		callback(err, me.docArray);
	});
};

module.exports = CheckoutDocumentArray;
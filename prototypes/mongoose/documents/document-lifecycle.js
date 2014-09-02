var async = require('async');
var utils = require('../utils');

// mongoose.Document.prototype.willUpdate = function(args, callback){
// 	return (callback && callback(null));
// };


// mongoose.Document.prototype.doUpdate = function(args, callback){
// 	var me = this;
// 	this.set(args, function(err){
// 	    if(!err){
// 	        docToSave = me;
// 	        if(me.parent)
// 	        	docToSave = me.parent();
// 			docToSave.save(callback);
// 			//me.ensureUpdateConsistency();
// 	    }
// 		else{
// 			callback(err);
// 	    }
// 	});
// };

// mongoose.Document.prototype.didUpdate = function(args, callback){
// 	return (callback && callback(null));
// };	

// //POST methods  Methods

// mongoose.Document.prototype.willCreate = function(args, callback){
// 	return this.willUpdate(args, callback);
// };

// mongoose.Document.prototype.doCreate = function(args, callback){
// 	return this.sgUpdate(args, callback);
// };

// mongoose.Document.prototype.didCreate = function(args){
// 	return (callback && callback(null));
// };


// //CREATE State machin:
// 	// POST
// 	//WillCreate WillUpdate DoUpdate DidUpdate  DidCreate
// 		// <==>
// 	//WillCreate sgUpdate  DidCreate

// //UPDATE State machin:
// 	// PUT
// 	//WillUpdate DoUpdate DidUpdate

// mongoose.Document.sgCreate = function(args, callback){
// 	async.chainMethods(['willCreate', 'doCreate', 'didCreate'], args, this, callback);
// }

// mongoose.Document.sgUpdate = function(args, callback){
// 	async.chainMethods(['willUpdate', 'doUpdate', 'didUpdate'], args, this, callback);
// }

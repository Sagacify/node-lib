var FRBugSchema = new Schema({
	message			: { type: String },
	file			: { type: String },
	line			: { type: String },
	other			: { type: String },
	count			: { type: Number, default: 0 }
});

FRBugSchema.method.getCreationDate = function() {
	return new Date(parseInt(this._id.toString().slice(0, 8), 16) * 1000);
};

FRBugSchema.methods.upsertBug = function(query) {
	model('FRBug').update(query, {
		$inc: { count: 1 }
	}, {
		upsert: true
	}, function(error) {
		if(error) {
			console.log('Couldn\'t save a request !');
			console.log(error);
		}
	});
};

model('FRBug', FRBugSchema);
var BugSchema = new Schema({
	message			: { type: String },
	file			: { type: String },
	line			: { type: String },
	other			: { type: String },
	count			: { type: Number, default: 0 }
});

BugSchema.method.getCreationDate = function() {
	return new Date(parseInt(this._id.toString().slice(0, 8), 16) * 1000);
};

BugSchema.methods.upsertBug = function(query) {
	model('Bug').update(query, {
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

model('Bug', BugSchema);
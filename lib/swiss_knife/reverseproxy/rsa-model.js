var RPRsaSchema = new Schema({
	message 		: {type: String},
});

RPRsaSchema.virtual('creation_date').get(function() {
	return new Date(parseInt(this._id.toString().slice(0,8), 16) * 1000);
});

RPRsaSchema.methods.saveBug = function(){
	this.save(function(error) {
		if(error) {
			console.log('Couldn\'t save a request !');
			console.log(error);
		}
	});
};

model('RPRsa', RPRsaSchema);
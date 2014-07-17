var SLBugSchema = new Schema({
	creation_date	:	{
		type: Date,
		default: Date.now
	}
}, {
	strict: false
});

SLBugSchema.methods.saveBug = function () {
	this.save(function (error) {
		if(error) {
			console.log('Couldn\'t save a request log !');
			console.log(error);
		}
	});
};

model('SLBug', SLBugSchema);
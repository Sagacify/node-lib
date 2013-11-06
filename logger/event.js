var EventSchema = new Schema({
	_id				:	{ type: String },
	type			:	{ type: String },
	present			:	{
		start_time	:	{ type: Date },
		count		:	{ type: Number }
	},
	history			:	[{
		end_time	:	{ type: Date },
		start_time	:	{ type: Date },
		count		:	{ type: Number }
	}]
});

EventSchema.methods.saveEvent = function () {
	this.save(function (error) {
		if(error) {
			console.log('Couldn\'t save an event !');
			console.log(error);
		}
	});
};

model('Event', EventSchema);
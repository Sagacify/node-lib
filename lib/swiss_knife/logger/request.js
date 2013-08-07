var SLRequestSchema = new Schema({
	ip_addr 		: {type: String},
	ip_version 		: {type: String},
	tcp_port	 	: {type: String},
	url 			: {type: String},
	req_protocol 	: {type: String},
	http_method 	: {type: String},
	http_refferer 	: {type: String},
	http_status 	: {type: String},
	user 			: {type : Schema.ObjectId, ref : 'User'},
	user_agent 		: {type: String},
	response_time 	: {type: String},
	req_body 		: {type: String},
	req_length 		: {type: String}
});

SLRequestSchema.virtual('creation_date').get(function() {
	return new Date(parseInt(this._id.toString().slice(0,8), 16) * 1000);
});

SLRequestSchema.methods.saveRequest = function(){
	this.save(function(error) {
		if(error) {
			console.log('Couldn\'t save a request !');
			console.log(error);
		}
	});
};

model('SLRequest', SLRequestSchema);
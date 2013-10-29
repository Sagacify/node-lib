var expiration = Config.expiration;

var TokenSchema = new Schema({
	_id				: {
		type		: String
	},
	expiration		: {
		type		: Date,
		default		: Date.now,
		expires		: expiration
	}
}, {
	autoIndex		: true
});

model('Token', TokenSchema);

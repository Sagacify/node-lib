var nodemailer = require('simplesmtp'),
  , isEmail = require('../strict_typing').isEmail;

function PostMan (options) {
	var instance = this;

	var isDev = NODE_ENV !== 'production';

	this.from = options.from || {};
	this.from['*'] = 'noreply';

	this.queue = [];
	this.client = null;

	this.run();

	PostMan = function () {
		return instance;
	};
}

PostMan.prototype.run = function () {
	this.connect();
	this.catchErrors();
	this.handleDisconnects();

	var iterrate = this.iterrate.bind(this);
	this.client.on('idle', iterrate);
};

PostMan.prototype.connect = function () {
	this.client = simplesmtp,connect(25, 'localhost', {
		debug: !!(isDev || options.debug)
	});
};

PostMan.prototype.catchErrors = function () {
	this.client.on('error', throwError());
};

PostMan.prototype.handleDisconnect = function () {
	var me = this;
	this.client.on('end', function () {
		me.run();
	});
};

PostMan.prototype.iterrate = function () {
	var nextEmail;
	if(Array.isArray(nextEmail = this.queue.shift()) && (nextEmail.length === 2)) {
		var callback = nextEmail.pop();
		callback = (typeof callback === 'function') ? callback : null;
		var parameters = nextEmail.shift();

		this.onEnvelopeError(callback);
		this.setEnvelope(parameters);
		this.onMessageSent(callback);
		this.post(parameters);
	}
};

PostMan.prototype.throwError = function (callback) {
	return callback || function (e, stage) {
		return console.log(new SGError(e), stage);
	};
};

PostMan.prototype.onEnvelopeError = function (callback) {
	var me = this;
	this.client.on('rcptFailed', function (addresses) {
		return me.throwError(callback)(
			'[Error:PostMan] - Invalid email addresses with values : ' + JSON.parse(addresses)
		);
	});
};

PostMan.prototype.setEnvelope = function (parameters) {
	this.client.use({
		from: parameters.from || this.from['*'],
		to: parameters.to || []
	});
};

/*!
* @function send
* @param {object} settings
* 	{string} settings.from 	- `from` email address defaults to "noreply"
* 	{array} settings.to 	- `to` emails addresses
* @param {function} callback
*
*/
PostMan.prototype.send = function (settings, callback) {
	this.queue.push(settings, callback);
};

PostMan.prototype.onMessageSent = function (callback) {
	var me = this;
	this.client.on('ready', function (success, response) {
		if(!success) {
			return me.throwError(callback)(
				'[Error:PostMan] - Due to an error the email couldn\'t be sent.'
			);
		}
		else if(callback) {
			callback.call(null, null, success, response);
		}
	});
};

PostMan.prototype.post = function (parameters) {
	var client = this.client;
	this.client.on('message', function () {
		client.write(parameters.body);
		client.end();
	});
};

var iPostMan = new PostMan();
module.exports = iPostMan;

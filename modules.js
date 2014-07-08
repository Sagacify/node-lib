global.mongoose = require('mongoose');
require('mongoose-schema-extend');

global.Schema = mongoose.Schema;
global.ObjectId = Schema.ObjectId;
global.Model = mongoose.Model;
global.model = mongoose.model.bind(mongoose);

module.exports = {
	// authentication

	// benchmarks

	// cache

	// child_process
	child_process: require('./child_process/child_process'),

	// communication

	// consistency

	// console

	// dataskelleton

	// develop

	// errorhandler

	/// escaping
	sanitize: require('./escaping/Sanitize'),

	// file
	file_manager: require('./file/file_manager'),
	virusScan: require('./file/virusScan'),

	// fuzzing

	// hashing

	// identity

	// languages

	// logger

	// mail

	// middlewares

	// mimetypes
	content_type: require('./mimetypes/content_type'),

	// model_share

	// mongo-middleware

	// payment

	// prototypes

	// regexes

	// route_handler

	// route_recorder

	// search

	// security

	// seo

	// strict_typing
	SGStrictTyping: require('./strict_typing/SGStrictTyping'),
	validateFormat: require('./strict_typing/validateFormat'),
	validateType: require('./strict_typing/validateType')

	// validation
};